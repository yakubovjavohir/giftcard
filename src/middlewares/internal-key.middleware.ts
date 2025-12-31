import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

export function internalServiceKeyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const incomingKey = req.header("x-internal-service-key");
  if (!incomingKey) {
    return res.status(401).json({
      message: "Missing internal service key",
    });
  }

  if (incomingKey !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(401).json({
      message: "Invalid internal service key",
    });
  }

  next();
}
