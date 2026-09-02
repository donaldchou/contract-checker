import mongoose, {
  Schema,
  model,
  models,
  type InferSchemaType,
} from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // 只存 bcrypt 雜湊，永不存明碼。
    // select:false -> 一般查詢不帶出，登入比對時要 .select("+passwordHash")
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

// 加欄位後要重啟 next dev，因為 compiled model 被 global 快取
export const User =
  (models.User as mongoose.Model<UserDoc>) ||
  model<UserDoc>("User", UserSchema);
