import { Request, Response, Router } from "express";
import Product, { validateProduct } from "../model/product";
import { validateId } from "../model/common";

const router = Router();

router.get("/get-products", async (req: Request, res: Response) => {
  try {
    const data = await Product.find().select("-__v");

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ data: [] });
  }
});

router.post("/get-by-id", async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!validateId(id)) {
    return res.json({
      error: true,
      message: "Product Id must be in right format!",
    });
  }

  const data = await Product.findById(id).select("-__v");
  res.json({ error: false, data });
});

router.post("/create", async (req: Request, res: Response) => {
  const errorMessage: string = validateProduct(req.body)!;

  if (errorMessage) {
    return res.json({ error: true, message: errorMessage });
  }

  const {
    title,
    description,
    imageUrl,
    price,
    reviews,
    onSale,
    category,
    role,
  } = req.body;

  Product.create({
    title,
    description,
    imageUrl,
    price,
    reviews,
    onSale,
    category,
    role,
  })
    .then(() => res.json({ error: false, message: "Product Created!" }))
    .catch((e) => res.json({ error: true, message: e.message }));
});

router.patch("/update-by-id", async (req: Request, res: Response) => {
  const { _id, price, title, imageUrl, description, onSale, category, role } =
    req.body;

  try {
    const product = await Product.findOne({ _id, role });

    if (!product) {
      return res
        .status(404)
        .json({ message: "No product fetched fron database." });
    }

    product.category = category;
    product.price = price;
    product.title = title;
    product.imageUrl = imageUrl;
    product.description = description;
    product.onSale = onSale;

    await product.save();
    res.json({ message: "Product updated successfully." });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.delete("/delete-by-id", (req: Request, res: Response) => {
  const { id } = req.body;

  if (!validateId(id)) {
    return res.json({ error: true, message: "Id must be in right format!" });
  }

  Product.findByIdAndRemove(id)
    .then(() => res.json({ error: false, message: "Product deleted." }))
    .catch((e) => res.json({ error: true, message: e.message }));
});

export default router;
