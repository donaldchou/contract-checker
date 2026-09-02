import { z } from "zod";

/** 註冊 / 登入共用：email + password */
export const registerSchema = z.object({
  email: z.email("email 格式不正確").trim().toLowerCase(),
  // bcrypt 只吃前 72 bytes，超過的部分會被忽略，所以直接擋掉
  password: z.string().min(8, "密碼至少 8 碼").max(72, "密碼最多 72 碼"),
});

export const loginSchema = z.object({
  email: z.email("email 格式不正確").trim().toLowerCase(),
  password: z.string().min(1, "請輸入密碼"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
