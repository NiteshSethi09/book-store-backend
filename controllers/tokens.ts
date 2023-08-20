import { NextFunction, Request, Response } from "express";
import { sign, verify } from "jsonwebtoken";
import { JWTSecret } from "../utils/config";

export interface AccessToken {
  id: string;
  name: string;
  email: string;
  role: string;
}

const secret = JWTSecret!;

export const signAccessToken: (T: AccessToken) => string = (
  tokenPayload: AccessToken
) => {
  const signedToken = sign(tokenPayload, secret, { expiresIn: "5m" });
  return signedToken;
};

export const signRefreshToken: (T: AccessToken) => string = (
  tokenPayload: AccessToken
) => {
  const signedToken = sign(tokenPayload, secret, { expiresIn: "7d" });
  return signedToken;
};

export const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const headerToken = req.headers.authorization;
    const token = headerToken?.split(" ");
    if (token && token?.length! > 1) {
      const t = verify(token[1], secret);
      next();
    }
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
