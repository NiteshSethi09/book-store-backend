import Joi from "joi";
import { model, ObjectIdSchemaDefinition, Schema, Types } from "mongoose";

export interface Item {
  product: object;
  quantity: number;
}

export interface OrderDetails {
  order_id: string;
  totalAmount: number;
  currency: string;
  upi_transaction_id?: string;
  email?: string;
  method?: string;
}

interface Order {
  items: Item[];
  user: {
    name: string;
    userId: ObjectIdSchemaDefinition;
  };
  orderPlacedDate?: Date;
  orderDetails?: OrderDetails;
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
  orderDetails: {
    order_id: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    upi_transaction_id: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    method: {
      type: String,
      required: false,
    },
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
