import Joi from "joi";
import { model, ObjectIdSchemaDefinition, Schema, Types } from "mongoose";

export interface Item {
  product: object;
  quantity: number;
}

interface Order {
  items: Item[];
  user: {
    name: string;
    userId: ObjectIdSchemaDefinition;
  };
  orderPlacedDate?: Date;
  totalAmount?: number;
}

const orderSchema: Schema<Order> = new Schema<Order>({
  items: [
    {
      product: {
        type: Object,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  user: {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  orderPlacedDate: {
    type: Date,
    default: Date.now(),
  },
  totalAmount: {
    type: Number,
    required: true,
  },
});

export function validateOrder(object: Order): string | undefined {
  const { error } = Joi.object<Order>({
    items: Joi.array()
      .items(
        Joi.object({
          product: Joi.object().required(),
          quantity: Joi.number().required().max(5),
        })
      )
      .required()
      .min(1),
    user: Joi.object({
      name: Joi.string().required(),
      // (should accept a mongoose type objectId) needs to be reviewed, error prone
      userId: Joi.required(),
    }),
  }).validate(object);

  if (error) return error.details[0].message;
}

export default model<Order>("Order", orderSchema);
