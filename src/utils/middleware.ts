import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { db } from "../config/db.config";

type DecodedToken = jwt.JwtPayload & {
  userId: string;
  access: string;
};

export const requireAuth = (req: Request, _: Response, next: NextFunction) => {
  try {
    console.log(
      `${new Date().toUTCString()} - ${req.method} - ${req.originalUrl}`,
    );

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const error = new Error("Token missing");
      return next(error);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      const error = new Error("Token missing");
      return next(error);
    }

    jwt.verify(token, env.JWT_SECRET as string, async (err, decoded) => {
      if (err) {
        return next("Token invalid");
      } else {
        const decodedToken = decoded as DecodedToken;
        const userId = decodedToken.userId;

        // this can be stale, so take the "access" from the db
        const adminUsersCollection = db.collection(env.ADMIN_USERS_COLLECTION);
        const userDoc = await adminUsersCollection.doc(userId).get();
        if (!userDoc.exists || !userDoc.data()) {
          return next("User does not exist");
        }

        const userData = userDoc.data();
        if (!userData || !userData.access) {
          return next("Token invalid");
        }

        req.body.userId = userId;
        req.body.access = userData.access;
        next();
      }
    });
  } catch (error) {
    next("Token invalid");
  }
};

const whitelist = ["127.0.0.1", "192.168.1.1"];

export const ipRestriction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const clientIp = req.ip;

  if (clientIp && whitelist.includes(clientIp)) {
    next();
  } else {
    res.status(403).json({ message: "Access denied: IP not allowed" });
  }
};
