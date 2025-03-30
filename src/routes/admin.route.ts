import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { env } from "../config/env";
import { db } from "../config/db.config";

const jwtSecret = env.JWT_SECRET as string;
const jwtExpiry = env.JWT_EXPIRY;
const adminUsersCollection = db.collection(env.ADMIN_USERS_COLLECTION);

const postLogin = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  console.log("Login request received", email, password);
  if (!email || !password) {
    return res.status(400).send({
      success: false,
      message: "Please provide email and password",
    });
  }
  try {
    const userDoc = await adminUsersCollection.doc(email).get();
    if (!userDoc.exists || !userDoc.data()) {
      return res.status(200).send({
        success: false,
        message: "No users found with this email",
      });
    }
    const userData = userDoc.data();
    const adminPassword = userData?.password;
    const access = userData?.access;
    if (!adminPassword) {
      return res.status(200).send({
        success: false,
        message: "Password is not configured for this user",
      });
    }
    if (password === adminPassword) {
      const token = jwt.sign({ userId: email, access: access }, jwtSecret, {
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
