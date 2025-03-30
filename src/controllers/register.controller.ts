import { Response, Request } from "express";
import { db } from "../config/db.config";
import { env } from "../config/env";
import { Registration } from "../utils/types";
import { updateRegCount } from "./stats.controller";

const collection = db.collection(env.REGISTRATIONS_COLLECTION);

export const submitForm = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      name,
      rollno,
      branch,
      year,
      email,
      phno,
      paymentplatform,
      transactionid,
    }: Registration = req.body;

    if (
      !name ||
      !rollno ||
      !branch ||
      !year ||
      !email ||
      !phno ||
      !paymentplatform ||
      !transactionid
    ) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    const docRef = collection.doc(transactionid.toUpperCase());
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      res.json({
        success: false,
        message: "Registration already exists",
      });
    } else {
      const data: Registration = {
        ...req.body,
        paymentStatus: "pending",
        mailSent: false,
        createdAt: new Date().toISOString(),
      };
      collection
        .doc(transactionid.toUpperCase())
        .set(data)
        .then(async () => {
          console.log("Registration created successfully");
          await updateRegCount()
          res.status(200).json({
            success: true,
            message: "Registration created successfully",
          });
          return;
        })
        .catch((error) => {
          console.error("Error occurred: ", error);
          res.status(500).json({
            success: false,
            message: "Failed to create registration",
          });
        });
    }
  } catch (error) {
    console.error("Error occurred: ", error);
    res.status(500).json({
      success: false,
      message: "Failed",
      error: "Internal server error",
    });
  }
};


export const getAllParticipants = async (
  _: Request,
  res: Response,
): Promise<void> => {
  const querySnapshot = await collection.get();
  const users = querySnapshot.docs.map((doc) => doc.data());
  res.status(200).send({
    success: true,
    data: users,
  });
};