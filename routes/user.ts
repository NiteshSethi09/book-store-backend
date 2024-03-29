import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { verify } from "jsonwebtoken";

import sendMail, { MailData } from "../utils/mail";
import { resetPasswordMessage, signupMessage } from "../utils/messageConstants";
import User, { validateUser } from "../model/user";
import {
  AccessToken,
  signAccessToken,
  signRefreshToken,
} from "../controllers/tokens";
import { JWTSecret } from "../utils/config";

const secret = JWTSecret!;

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  const errorMessage = validateUser(req.body);

  if (errorMessage) {
    return res.json({ error: true, message: errorMessage });
  }

  let { name, email, password, role } = req.body;

  const salt: string = await bcrypt.genSalt(+process.env.SALTROUND!);
  password = await bcrypt.hash(password, salt);

  const verificationToken: string = crypto.randomBytes(128).toString("hex");

  User.create({ name, email, password, verificationToken, role })
    .then(() => {
      const message = signupMessage(verificationToken);
      const mailData: MailData = {
        email,
        message,
        subject: "Please verify your account!",
      };
      return mailData;
    })
    .then((mailData) => sendMail(mailData))
    .then(() =>
      res.json({ error: false, message: "User created successfully." })
    )
    .catch((e) =>
      res.json({
        error: true,
        message:
          "Error while signing up. Please make sure you are using the right Email.",
      })
    );
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email, role });
  if (!user) {
    return res.json({
      error: true,
      message: "Entered information is wrong!",
    });
  }

  if (await bcrypt.compare(password, user.password)) {
    const accessToken = signAccessToken({
      name: user.name,
      email: user.email,
      id: user._id.toString(),
      role,
    });

    const refreshToken = signRefreshToken({
      name: user.name,
      email: user.email,
      id: user._id.toString(),
      role,
    });

    res.json({
      error: false,
      user: {
        accessToken,
        refreshToken,
      },
    });
  } else {
    res.json({
      error: true,
      message: "User not found. Please check the credentials.",
    });
  }
});

router.get("/refresh", (req: Request, res: Response) => {
  try {
    const refreshToken = req.headers.authorization;
    const token = refreshToken?.split(" ");

    if (token && token?.length! > 1) {
      const t = verify(token[1], secret) as AccessToken;

      const accessToken = signAccessToken({
        email: t.email,
        id: t.id,
        name: t.name,
        role: t.role,
      });
      res.json({
        error: false,
        user: {
          accessToken,
          refreshToken: token[1],
        },
      });
    }
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
});

router.post("/verify-account/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { role } = req.body;

    const user = await User.findOne({ verificationToken: token, role });

    user!.verified = true;
    user!.verificationToken = undefined;

    await user!.save();

    res.json({ error: false, message: "User verified successfully!" });
  } catch (error) {
    res.json({
      error: true,
      message:
        "The user may already be verified, please check, or we are unable to proceed right now.",
    });
  }
});

router.post("/reset-password", async (req: Request, res: Response) => {
  const { email, role } = req.body;

  const resetToken: string = crypto.randomBytes(128).toString("hex");

  await User.findOneAndUpdate(
    { email, role },
    { resetToken, resetTokenExpiration: new Date(Date.now() + 3600000) }
  );

  const message = resetPasswordMessage(resetToken);
  const mailData: MailData = {
    email,
    message,
    subject: "Reset Password!",
  };

  await sendMail(mailData);
  res.json({ error: false, message: "mail has been send to your email." });
});

router.post("/reset-password/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    let { password, role } = req.body;

    if (!password) {
      return res.json({
        error: true,
        message: "Please provide the password.",
      });
    }

    const salt: string = await bcrypt.genSalt(+process.env.SALTROUND!);
    password = await bcrypt.hash(password, salt);

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
      role,
    });

    user!.password = password;
    user!.resetToken = undefined;
    user!.resetTokenExpiration = undefined;

    await user!.save();

    res.json({ error: false, message: "Password reset successfully!" });
  } catch (error) {
    res.json({
      error: true,
      message:
        "Maybe the request is already fulfilled before or we are unable to proceed right now.",
    });
  }
});

export default router;
