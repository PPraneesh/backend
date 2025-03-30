import { Response, Request } from "express";
import { db } from "../config/db.config";
import { env } from "../config/env";
export const submitFeedback = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const rollno = req.body.rollno;
    if (!rollno) {
      res.status(500).json({
        status: false,
        message: "Roll number is required!"
      })
      return;
    }

    db.collection(env.FEEDBACK_COLLECTION)
      .doc(rollno)
      .set(req.body)
      .then(() => {
        res.status(200).json({
          status: true,
          message: "Feedback submitted successfully!",
        })
        return;
      })
      .catch((error) => {
        res.status(500).json({
          status: false,
          message: `Error submitting feedback`,
        })
      });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: `Internal server error`,
    })
  }
};
