import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { portNumber } from "./utils/config";

import productRoutes from "./routes/product";
import userRoutes from "./routes/user";
import reviewRoutes from "./routes/review";

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("hello");
});

app.use("/product", productRoutes);
app.use("/user", userRoutes);
app.use("/review", reviewRoutes);

mongoose
  .connect(process.env.MONGOOSE_DB_URI!)
  .then(() => app.listen(portNumber, () => console.log("Server is running.")))
  .catch((e) => console.log("DB connection error:", e.message));
