import { Request, Response, Router } from "express";
import parser from "../utils/parser";
import Review, { validateReview } from "../model/review";
import { validateId } from "../model/common";

const router = Router();

router.get("/get-reviews", async (req: Request, res: Response) => {
  const reviews = await Review.find();

  res.json(reviews);
});

router.get("/get-review-by-id", async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!validateId(id)) {
    return res.json({
      error: true,
      message: "Review Id must be in right format!",
    });
  }

  const review = await Review.findOne({ _id: id });

  res.json({ review });
});

router.post("/create-review", parser, (req: Request, res: Response) => {
  const errorMessage = validateReview(req.body);

  if (errorMessage) {
    return res.json({ error: true, message: errorMessage });
  }

  const { reviewDescription, reviewByUser, reviewOfProduct } = req.body;

  Review.create({ reviewDescription, reviewByUser, reviewOfProduct })
    .then(() => res.json({ error: false, message: "Product created!" }))
    .catch((e) => res.json({ error: true, message: e.message }));
});

router.delete("/delete-review", async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!validateId(id)) {
    return res.json({ error: true, message: "Id must be in right format!" });
  }

  Review.findByIdAndRemove(id)
    .then(() => res.json({ error: false, message: "Product deleted." }))
    .catch((e) => res.json({ error: true, message: e.message }));
});

export default router;
