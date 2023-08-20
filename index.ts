import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { performance } from "perf_hooks";
import { portNumber } from "./utils/config";
import { logger } from "./utils/logger";

import productRoutes from "./routes/product";
import userRoutes from "./routes/user";
import uploadRoutes from "./routes/common";
import razorpayRoutes from "./routes/razorpay";
import orderRoutes from "./routes/order";

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use(function (req, res, next) {
  const timeIn = performance.now();
  next();
  const timeOut = performance.now() - timeIn;
  logger.info(
    `requested URL: ${req.originalUrl} executed in ${timeOut.toFixed(2)} ms.`
  );
});

app.get("/", (req: Request, res: Response) => {
  res.send("hello");
});

app.use("/product", productRoutes);
app.use("/user", userRoutes);
app.use("/common", uploadRoutes);
app.use("/razorpay", razorpayRoutes);
app.use("/order", orderRoutes);

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGOOSE_DB_URI!)
  .then(() => app.listen(portNumber, () => console.log("Server is running.")))
  .catch((e) => console.log("DB connection error:", e.message));
