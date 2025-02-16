import { Request, Response, NextFunction } from "express";

export const middleware = (req: Request, _: Response, next: NextFunction) => {
  try {
    console.log(
      `${new Date().toUTCString()} - ${req.method} - ${req.originalUrl}`,
    );

    console.log(`IP Address: ${req.ip}`);
    console.log(`Hostname: ${req.hostname}`);
    console.log("--------------------\n\n");
    next();
  } catch (error) {
    next("Token invalid");
  }
};
