import Joi from "joi";
import { model, Schema } from "mongoose";

const Category: string[] = [
  "Lifestyle",
  "Personal Development",
  "Health & Wellbeing",
  "Career Development",
];

export interface IProduct {
  title: string;
  imageUrl: string;
  description: string;
  price: {
    originalPrice: number;
    offerPrice: number;
  };
  onSale: boolean;
  category: string;
  role: "USER" | "ADMIN";
}

const productSchema: Schema<IProduct> = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
    },
    imageUrl: { type: String, required: true },
    description: {
      type: String,
      required: true,
    },
    price: {
      originalPrice: {
        type: Number,
        required: true,
      },
      offerPrice: {
        type: Number,
        required: true,
      },
    },
    onSale: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: Category,
    },
    role: {
      type: String,
      required: true,
      default: "USER",
      enum: ["USER", "ADMIN"],
    },
  },
  { timestamps: true }
);

export function validateProduct(object: IProduct): string | undefined {
  const { error } = Joi.object<IProduct>({
    title: Joi.string().required(),
    description: Joi.string().required(),
    imageUrl: Joi.string().required(),
    price: Joi.object().keys({
      originalPrice: Joi.number().required(),
      offerPrice: Joi.number().required(),
    }),
    onSale: Joi.bool(),
    category: Joi.string()
      .valid(...Category)
      .required(),
    role: Joi.string().required(),
  }).validate(object);

  if (error) return error.details[0].message;
}

export default model<IProduct>("Product", productSchema);
