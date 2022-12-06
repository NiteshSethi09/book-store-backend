import Joi from "joi";
import { model, ObjectIdSchemaDefinition, Schema, Types } from "mongoose";

interface Review {
  reviewDescription: string;
  reviewByUser: ObjectIdSchemaDefinition;
  reviewOfProduct: ObjectIdSchemaDefinition;
}

const reviewSchema: Schema<Review> = new Schema<Review>(
  {
    reviewDescription: {
      type: String,
      required: true,
    },
    reviewByUser: {
      type: Types.ObjectId,
      ref: "User",
    },
    reviewOfProduct: {
      type: Types.ObjectId,
      ref: "Product",
    },
  },
  { timestamps: true }
);

export function validateReview(object: Review): string | undefined {
  const { error } = Joi.object<Review>({
    reviewDescription: Joi.string().required(),
    // (should accept a mongoose type objectId) needs to be reviewed, error prone
    reviewByUser: Joi.string(),
    // (should accept a mongoose type objectId) needs to be reviewed, error prone
    reviewOfProduct: Joi.string(),
  }).validate(object);

  if (error) return error.details[0].message;
}

export default model<Review>("Review", reviewSchema);
