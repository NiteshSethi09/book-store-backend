import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { portNumber } from "./utils/config";

import productRoutes from "./routes/product";
import userRoutes from "./routes/user";
import reviewRoutes from "./routes/review";
import razorpayRoutes from "./routes/razorpay";
import orderRoutes from "./routes/order";

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: false, limit: "5mb" }));
app.use(express.json({ limit: "5mb" }));
app.use(cors());

app.use(function (req, res, next) {
  const timeIn = performance.now();
  next();
  const timeOut = performance.now() - timeIn;
  console.log(timeOut.toFixed(2));
});

app.get("/", (req: Request, res: Response) => {
  res.send("hello");
});

app.use("/product", productRoutes);
app.use("/user", userRoutes);
app.use("/review", reviewRoutes);
app.use("/razorpay", razorpayRoutes);
app.use("/order", orderRoutes);

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGOOSE_DB_URI!)
  .then(() => app.listen(portNumber, () => console.log("Server is running.")))
  .catch((e) => console.log("DB connection error:", e.message));
