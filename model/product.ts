import Joi from "joi";
import { model, Schema } from "mongoose";

const Category: string[] = [
  "Lifestyle",
  "Personal Development",
  "Health & Wellbeing",
  "Career Development",
];

interface Product {
  title: string;
  imageUrl: string;
  description: string;
  price: {
    originalPrice: number;
    offerPrice: number;
  };
  onSale: boolean;
  category: string;
}

const productSchema: Schema<Product> = new Schema<Product>(
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
  },
  { timestamps: true }
);

export function validateProduct(
  object: Product
): Joi.ValidationErrorItem[] | undefined {
  const { error } = Joi.object<Product>({
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
  }).validate(object);

  if (error) return error.details;
}

export default model<Product>("Product", productSchema);
