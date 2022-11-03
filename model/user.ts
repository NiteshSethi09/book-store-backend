import Joi from "joi";
import { model, Schema } from "mongoose";

interface User {
  name: string;
  email: string;
  password: string;
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
});

export function validateUser(
  object: User
): Joi.ValidationErrorItem[] | undefined {
  const { error } = Joi.object<User>({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
  }).validate(object);

  if (error) return error.details;
}

export default model<User>("User", userSchema);
