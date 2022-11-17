import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import { ObjectIdSchemaDefinition } from "mongoose";
import crypto from "crypto";
import { validate } from "deep-email-validator";

import parser, { CustomRequest } from "../utils/parser";
import sendMail, { MailData } from "../utils/mail";
import { resetPasswordMessage, signupMessage } from "../utils/messageConstants";
import Order, { validateOrder } from "../model/order";
import User, { validateUser } from "../model/user";

const router = Router();

router.get("/get-user", async (req: Request, res: Response) => {
  const user = await User.findOne({ _id: (req as CustomRequest).user }).select(
    "-password"
  );

  res.json({ error: false, user });
});

router.post("/signup", async (req: Request, res: Response) => {
  const errorMessage = validateUser(req.body);

  if (errorMessage) {
    return res.json({ error: true, message: errorMessage });
  }

  let { name, email, password } = req.body;

  const { valid, validators, reason } = await validate(email);

  if (!valid) {
    return res.json({
      error: true,
      message: validators[reason as keyof typeof validators]?.reason,
    });
  }

  if (await User.findOne({ email })) {
    return res.json({
      error: true,
      message: "Please make sure you are using the right Email.",
    });
  }

  const salt: string = await bcrypt.genSalt(+process.env.SALTROUND!);
  password = await bcrypt.hash(password, salt);

  const verificationToken: string = crypto.randomBytes(128).toString("hex");

  User.create({ name, email, password, verificationToken })
    .then(() =>
      res.json({ error: false, message: "User created successfully." })
    )
    .then(() => {
      const message = signupMessage(verificationToken);
      const mailData: MailData = {
        email,
        message,
        subject: "Please verify your account!",
      };

      sendMail(mailData);
    })
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

  if (await bcrypt.compare(password, user.password)) {
    res.json({
      error: false,
      message: "User found",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
    });
  } else {
    res.json({
      error: true,
      message: "User not found. Please check the credentials.",
    });
  }
});

router.post("/verify-account/:token", async (req: Request, res: Response) => {
  const { token } = req.params;

  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return res.json({
      error: true,
      message: "Either the user is verified or trying with wrong token.",
    });
  }

  user!.verified = true;
  user.verificationToken = undefined;
  await user.save();
  res.json({ error: false, message: "User verified successfully!" });
});

router.post("/reset-password", async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.json({
      error: true,
      message: "Please provide the email.",
    });
  }

  const { valid, validators, reason } = await validate(email);

  if (!valid) {
    return res.json({
      error: true,
      message: validators[reason as keyof typeof validators]?.reason,
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({
      error: true,
      message: "Invalid Email.",
    });
  }
  const resetToken: string = crypto.randomBytes(128).toString("hex");

  user.resetToken = resetToken;
  user.resetTokenExpiration = new Date(Date.now() + 3600000);

  await user.save();

  res.json({ error: false, message: "mail has been send to your email." });

  const message = resetPasswordMessage(resetToken);
  const mailData: MailData = {
    email,
    message,
    subject: "Reset Password!",
  };

  sendMail(mailData);
});

router.post("/reset-password/:token", async (req: Request, res: Response) => {
  const { token } = req.params;
  let { password } = req.body;

  if (!password) {
    return res.json({
      error: true,
      message: "Please provide the password.",
    });
  }

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  });

  if (!user) {
    return res.json({
      error: true,
      message: "Time expired. Please reset the password again.",
    });
  }

  const salt: string = await bcrypt.genSalt(+process.env.SALTROUND!);
  password = await bcrypt.hash(password, salt);

  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;
  await user.save();

  res.json({ error: false, message: "Password reset successfully!" });
});

// Since add-to-cart route has been removed, below route needs to be fixed by latest functionality.
router.post("/place-order", parser, async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ _id: (req as CustomRequest).user });
    if (user?.cart.items.length! === 0) {
      return res.json({
        error: true,
        message:
          "Oops! There is no item in cart. Can't place order with empty cart.",
      });
    }

    user
      ?.populate("cart.items.productId")
      .then((user) => {
        const items = user.cart.items.map((item) => ({
          product: { ...(item.productId as any)._doc }, //this needs to be reviewed
          quantity: item.quantity,
        }));

        const newOrder = {
          items,
          user: {
            name: user.name,
            userId: user._id as unknown as ObjectIdSchemaDefinition, //this needs to be reviewed
          },
        };

        const errorMessage = validateOrder(newOrder);

        if (errorMessage) {
          return res.json({ error: true, message: errorMessage });
        }

        Order.create(newOrder)
          .then(() => {
            user.cart.items = [];
            user.save();
          })
          .then(() =>
            res.json({ error: false, message: "Order created successfully!" })
          )
          .catch((e) => res.json({ error: true, message: e.message }));
      })
      .catch((e) => res.json({ error: true, message: e.message }));
  } catch (e) {
    res.json({ error: true, message: "Error while placing an order!" });
  }
});

export default router;
