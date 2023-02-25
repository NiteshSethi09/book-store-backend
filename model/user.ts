import Joi from "joi";
import { model, Schema } from "mongoose";

interface User {
  name: string;
  email: string;
  password: string;
  verified: boolean;
  verificationToken: string | undefined;
  resetToken: string | undefined;
  resetTokenExpiration: Date | undefined;
  role: "USER" | "ADMIN";
}

const userSchema: Schema<User> = new Schema<User>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    required: true,
    default: "USER",
    enum: ["USER", "ADMIN"],
  },
  verificationToken: String,
  resetToken: String,
  resetTokenExpiration: Date,
});

export function validateUser(object: User): string | undefined {
  const { error } = Joi.object<User>({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
  }).validate(object);

  if (error) return error.details[0].message;
}

export default model<User>("User", userSchema);
