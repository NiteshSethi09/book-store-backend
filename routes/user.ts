import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validate } from "deep-email-validator";

import sendMail, { MailData } from "../utils/mail";
import { resetPasswordMessage, signupMessage } from "../utils/messageConstants";
import User, { validateUser } from "../model/user";

const router = Router();

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
    .catch((e) =>
      res.json({
        error: true,
        message:
          "Error while signing up. Please make sure you are using the right Email.",
      })
    );
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

  await User.findOneAndUpdate(
    { verificationToken: token },
    { verified: true, verificationToken: undefined }
  );

  res.json({ error: false, message: "User verified successfully!" });
});

router.post("/reset-password", async (req: Request, res: Response) => {
  const { email } = req.body;

  const { valid, validators, reason } = await validate(email);

  if (!valid) {
    return res.json({
      error: true,
      message: validators[reason as keyof typeof validators]?.reason,
    });
  }

  const resetToken: string = crypto.randomBytes(128).toString("hex");

  await User.findOneAndUpdate(
    { email },
    { resetToken, resetTokenExpiration: new Date(Date.now() + 3600000) }
  );

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

  const salt: string = await bcrypt.genSalt(+process.env.SALTROUND!);
  password = await bcrypt.hash(password, salt);

  await User.findOneAndUpdate(
    {
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    },
    { password, resetToken: undefined, resetTokenExpiration: undefined }
  );

  res.json({ error: false, message: "Password reset successfully!" });
});

export default router;
