import type { Metadata } from "next";
import ContractChecker from "../ContractChecker";

export const metadata: Metadata = {
  title: "合約審查",
  description: "上傳合約檔案，AI 為你摘要重點、標出風險條款並給談判建議。",
};

export default function AnalyzePage() {
  return <ContractChecker />;
}
