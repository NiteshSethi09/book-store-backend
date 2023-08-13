import { Request, Response, Router } from "express";
import Razorpay from "razorpay";
import Order, { Item, OrderDetails, validateOrder } from "../model/order";
import { IProduct } from "../model/product";
import { razorpayKeyId, razorpaySecret } from "../utils/config";
import { verifyAccessToken } from "../controllers/tokens";

const router = Router();

const razorpay = new Razorpay({
  key_id: razorpayKeyId!,
  key_secret: razorpaySecret,
});

router.post(
  "/create-order",
  verifyAccessToken,
  async (req: Request, res: Response) => {
    try {
      const { items, user } = req.body;

      const loginUser = {
        userId: user._id,
        name: user.name,
      };
      const errorMessage = validateOrder({ items, user: loginUser });

      if (errorMessage) {
        return res.json({ error: true, message: errorMessage });
      }

      let totalAmount: number = 0;
      (items as Item[]).forEach((item: Item) => {
        const price = (item.product as IProduct).price.offerPrice;
        const quantyity = item.quantity;
        totalAmount += price * quantyity;
      });

      const data = await razorpay.orders.create({
        amount: totalAmount * 100,
        currency: "INR",
      });

      const { id, amount, currency } = data;

      const orderDetails: OrderDetails = {
        order_id: id,
        totalAmount: +amount / 100,
        currency,
      };

      Order.create({ items, user: loginUser, totalAmount, orderDetails })
        .then(() => res.json({ error: false, data }))
        .catch((e) => res.json({ error: true, message: e.message }));
    } catch (error) {
      res.json({
        error: true,
        message: "Some technical error occured while making an order!",
      });
    }
  }
);

router.post("/verify-payment", async (req: Request, res: Response) => {
  try {
    const {
      order_id,
      method,
      email,
      acquirer_data: { upi_transaction_id },
    } = req?.body?.payload?.payment?.entity;

    const order = await Order.findOne({ "orderDetails.order_id": order_id });
    if (!order) {
      return res.json({
        error: true,
        message: "Error while completing the payment",
      });
    }
    // The case is onlly for UPI method transaction. Needs to write a wrapper for every method
    order!.orderDetails!.email = email;
    order!.orderDetails!.method = method;
    order!.orderDetails!.upi_transaction_id = upi_transaction_id;
    await order.save();

    // No need of resing response as teh route is a webhook.
    // res.json({
    //   error: false,
    //   message: "Thanks for placinng your order. Payment Successfull.",
    // });
  } catch (e) {
    console.log({
      error: true,
      message: "Error while completing the payment!",
    });

    // res.json({ error: true, message: "Error while completing the payment!" });
  }
});

export default router;
