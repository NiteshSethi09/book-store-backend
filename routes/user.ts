import { Request, Response, Router } from "express";
import { sign } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import parser, { CustomRequest } from "../utils/parser";
import User, { validateUser } from "../model/user";

const router = Router();

router.get("/get-user", parser, async (req: Request, res: Response) => {
  const user = await User.findOne({ _id: (req as CustomRequest).user });

  res.json({ error: false, user });
});

router.post("/signup", async (req: Request, res: Response) => {
  const errorMessage = validateUser(req.body);

  if (errorMessage) {
    return res.json({ error: true, message: errorMessage });
  }

  let { name, email, password } = req.body;

  const salt: string = await bcrypt.genSalt(+process.env.SALTROUND!);
  password = await bcrypt.hash(password, salt);

  User.create({ name, email, password })
    .then(() =>
      res.json({ error: false, message: "User created successfully." })
    )
    .catch((e) => res.json({ error: true, message: e.message }));
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({
      error: true,
      message: "Entered information is wrong!",
    });
  }

  const token = sign({ _id: user._id }, process.env.JWT_PRIVATEKEY!);

  if (await bcrypt.compare(password, user.password)) {
    res
      .cookie("access_token", token)
      .json({ error: false, message: "User found", token });
  } else {
    res.json({
      error: true,
      message: "User not found. Please check the credentials.",
    });
  }
});

router.post("/logout", parser, async (req: Request, res: Response) => {
  res.clearCookie("access_token");

  res.json({ error: false, message: "Token Removed" });
});

export default router;
