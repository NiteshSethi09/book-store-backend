import { Request, Response, Router } from "express";
import Product, { validateProduct } from "../model/product";
import { validateId } from "../model/common";

const router = Router();

router.get("/get-products", async (req: Request, res: Response) => {
  // const pageLimit: number = +req.query?.limit! || 10;
  // const pageNumber: number = +req.query?.page! - 1 || 0;
  const title: string = String(req.query.title || "");

  try {
    const data = await Product.find({
      title: { $regex: title, $options: "i" },
    }).select("-__v");
    // .skip(pageNumber * pageLimit)
    // .limit(pageLimit)

    const pageCount: number = data.length;
    console.log(data, pageCount);

    res.json({ data, pageCount });
  } catch (error: any) {
    res.json({ data: [], pageCount: 0 });
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

  const { title, description, imageUrl, price, reviews, onSale, category } =
    req.body;

  if (await Product.findOne({ title })) {
    return res
      .status(400)
      .json({ error: true, message: "Product already exists" });
  }

  Product.create({
    title,
    description,
    imageUrl,
    price,
    reviews,
    onSale,
    category,
  })
    .then(() => res.json({ error: false, message: "Product Created!" }))
    .catch((e) => res.json({ error: true, message: e.message }));
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
