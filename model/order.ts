import Joi from "joi";
import { model, ObjectIdSchemaDefinition, Schema, Types } from "mongoose";

interface Order {
  items: { product: object; quantity: number }[];
  user: {
    name: string;
    userId: ObjectIdSchemaDefinition;
  };
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
});

export function validateOrder(
  object: Order
): Joi.ValidationErrorItem[] | undefined {
  const { error } = Joi.object<Order>({
    items: Joi.array()
      .items(
        Joi.object({
          product: Joi.object().required(),
          quantity: Joi.number().required(),
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

  if (error) return error.details;
}

export default model<Order>("Order", orderSchema);
