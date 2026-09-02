import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

// AI 針對單一風險條款的分析
const RiskItemSchema = new Schema(
  {
    clause: { type: String, default: "" }, // 相關條款 / 段落摘要
    issue: { type: String, required: true }, // 風險描述
    severity: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    suggestion: { type: String, default: "" }, // 修改建議
  },
  { _id: false },
);

const AnalysisSchema = new Schema(
  {
    summary: { type: String, default: "" }, // 合約整體摘要
    contractType: { type: String, default: "" }, // 合約類型（如：勞動契約、租賃契約）
    parties: { type: [String], default: [] }, // 合約當事人
    overallRisk: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    risks: { type: [RiskItemSchema], default: [] },
    missingClauses: { type: [String], default: [] }, // 建議補充的條款
    recommendations: { type: [String], default: [] }, // 整體建議
  },
  { _id: false },
);

const ContractSchema = new Schema(
  {
    // 綁定上傳的會員，只有本人能看到自己的分析結果
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fileName: { type: String, required: true },
    fileType: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    blobUrl: { type: String, required: true }, // Vercel Blob 檔案連結
    analysis: { type: AnalysisSchema, required: true },
    model: { type: String, default: "" }, // 使用的 Gemini model id
  },
  { timestamps: true },
);

export type ContractDoc = InferSchemaType<typeof ContractSchema>;

// 加欄位後要重啟 next dev，因為 compiled model 被 global 快取
export const Contract =
  (models.Contract as mongoose.Model<ContractDoc>) ||
  model<ContractDoc>("Contract", ContractSchema);
