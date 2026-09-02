const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 見 memory: gemini-current-model（2.5-flash 對新用戶 404）。
// 主要 model 可用 .env.local 的 GEMINI_MODEL 覆寫；主 model 遇到配額 / 過載時
// 自動退回 lite model（免費配額較寬、延遲低）。
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

const REQUEST_TIMEOUT_MS = 90_000;

function endpoint(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

export interface RiskItem {
  clause: string;
  issue: string;
  severity: "high" | "medium" | "low";
  suggestion: string;
}

export interface ContractAnalysis {
  summary: string;
  contractType: string;
  parties: string[];
  overallRisk: "high" | "medium" | "low";
  risks: RiskItem[];
  missingClauses: string[];
  recommendations: string[];
}

const responseSchema = {
  type: "object",
  properties: {
    summary: { type: "string", description: "合約整體內容摘要，3-5 句" },
    contractType: {
      type: "string",
      description: "合約類型，例如：勞動契約、房屋租賃契約、買賣契約、保密協議",
    },
    parties: {
      type: "array",
      items: { type: "string" },
      description: "合約當事人名稱或角色",
    },
    overallRisk: {
      type: "string",
      enum: ["high", "medium", "low"],
      description: "對委託方而言的整體風險等級",
    },
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          clause: { type: "string", description: "相關條款編號或段落摘錄" },
          issue: { type: "string", description: "該條款的風險或問題說明" },
          severity: { type: "string", enum: ["high", "medium", "low"] },
          suggestion: { type: "string", description: "具體修改或談判建議" },
        },
        required: ["issue", "severity", "suggestion"],
      },
    },
    missingClauses: {
      type: "array",
      items: { type: "string" },
      description: "這份合約缺少、但建議補上的條款",
    },
    recommendations: {
      type: "array",
      items: { type: "string" },
      description: "簽約前的整體行動建議",
    },
  },
  required: [
    "summary",
    "contractType",
    "parties",
    "overallRisk",
    "risks",
    "missingClauses",
    "recommendations",
  ],
};

const SYSTEM_PROMPT = `你是一位資深的台灣執業律師，專長於合約審閱。
使用者會上傳一份合約檔案，請你站在「委託你審閱的那一方」的立場，仔細審查：
1. 摘要合約重點與當事人。
2. 找出對委託方不利、模糊、或有法律風險的條款，逐條說明並給修改建議。
3. 指出缺少而應補上的條款。
4. 給出簽約前的整體建議。
請務必以繁體中文回答，並只輸出符合 schema 的 JSON。`;

// 目前實際使用的 model（成功後才有意義，供寫入 DB 記錄）
export let lastUsedModel = PRIMARY_MODEL;

async function callGemini(
  model: string,
  fileBase64: string,
  mimeType: string,
): Promise<Response> {
  return fetch(endpoint(model), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY as string,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        {
          role: "user",
          parts: [
            { text: "請審查這份合約。" },
            { inlineData: { mimeType, data: fileBase64 } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema,
      },
    }),
  });
}

export async function analyzeContract(
  fileBase64: string,
  mimeType: string,
): Promise<ContractAnalysis> {
  if (!GEMINI_API_KEY) {
    throw new Error("請在 .env.local 設定 GEMINI_API_KEY");
  }

  const models = PRIMARY_MODEL === FALLBACK_MODEL
    ? [PRIMARY_MODEL]
    : [PRIMARY_MODEL, FALLBACK_MODEL];

  let lastErr = "";

  for (const model of models) {
    let res: Response;
    try {
      res = await callGemini(model, fileBase64, mimeType);
    } catch (err) {
      // timeout / 網路錯誤 → 換下一個 model
      lastErr =
        err instanceof Error && err.name === "TimeoutError"
          ? `${model} 回應逾時`
          : `${model} 連線失敗：${err instanceof Error ? err.message : String(err)}`;
      continue;
    }

    if (res.ok) {
      const data = await res.json();
      const text: string | undefined =
        data?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text ?? "")
          .join("") || undefined;

      if (!text) {
        lastErr = `${model} 沒有回傳分析內容`;
        continue;
      }

      let parsed: Partial<ContractAnalysis>;
      try {
        parsed = JSON.parse(text);
      } catch {
        lastErr = `${model} 回傳的內容無法解析為 JSON`;
        continue;
      }

      lastUsedModel = model;
      return {
        summary: parsed.summary ?? "",
        contractType: parsed.contractType ?? "",
        parties: parsed.parties ?? [],
        overallRisk: parsed.overallRisk ?? "medium",
        risks: parsed.risks ?? [],
        missingClauses: parsed.missingClauses ?? [],
        recommendations: parsed.recommendations ?? [],
      };
    }

    // 非 2xx
    const errText = await res.text();
    lastErr = `${model} API 錯誤 (${res.status})`;
    // 429 配額 / 503 過載 → 試下一個 model；其他錯誤直接中止
    if (res.status !== 429 && res.status !== 503) {
      throw new Error(`${lastErr}: ${errText.slice(0, 300)}`);
    }
  }

  throw new Error(
    `所有 Gemini model 都暫時無法使用（${lastErr}）。免費配額或流量限制，請稍後再試。`,
  );
}
