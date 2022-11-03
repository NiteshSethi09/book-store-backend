import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";

export interface CustomRequest extends Request {
  user: string | JwtPayload;
}

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies["access_token"];

  if (!token) {
    return res.json({
      error: true,
      message: "Access denied! Please specify the token.",
    });
  }

  try {
    const decoded = verify(token, process.env.JWT_PRIVATEKEY!);
    (req as CustomRequest).user = decoded;
    next();
  } catch (e) {
    res.json({ error: true, message: "Invalid token" });
  }
};
