import { Request, Response, Router } from "express";
import Order from "../model/order";

const router = Router();

router.get("/get-orders", async (req: Request, res: Response) => {
  const result = await Order.find().select("-__v");

  res.json(result);
});

export default router;
