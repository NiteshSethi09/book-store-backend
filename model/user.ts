import Joi from "joi";
import { model, ObjectIdSchemaDefinition, Schema, Types } from "mongoose";

export interface Item {
  productId: ObjectIdSchemaDefinition;
  quantity: number;
}

interface User {
  name: string;
  email: string;
  password: string;
  cart: { items: Array<Item> };
  verified: boolean;
  verificationToken: string;
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
  cart: {
    items: [
      {
        productId: {
          type: Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
});

export function validateUser(
  object: User
): Joi.ValidationErrorItem[] | undefined {
  const { error } = Joi.object<User>({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
    cart: Joi.object({
      items: Joi.array().items(
        Joi.object<Item>({
          // (should accept a mongoose type objectId) needs to be reviewed, error prone
          productId: Joi.string().required(),
          quantity: Joi.number().required(),
        })
      ),
    }),
  }).validate(object);

  if (error) return error.details;
}

export default model<User>("User", userSchema);
