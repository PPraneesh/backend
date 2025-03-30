import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { env } from "../config/env";

const jwtSecret = env.JWT_SECRET as string;
const adminEmail = env.EMAIL;
const adminPassword = env.PASSWORD;
const jwtExpiry = env.JWT_EXPIRY;

const postLogin = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  try {
    if (email === adminEmail && password === adminPassword) {
      const token = jwt.sign({ userId: email, access: "admin" }, jwtSecret, {
        expiresIn: jwtExpiry as any,
      });
      return res.status(200).send({
        success: true,
        token: token,
        message: "Logged in successfully",
      });
    } else {
      return res
        .status(200)
        .send({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(401).send({ success: false, message: "Session Expired" });
  }
};

export { postLogin };
