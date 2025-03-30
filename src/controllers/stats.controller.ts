import { Response, Request } from "express";
import { db } from "../config/db.config";
import { env } from "../config/env";

const collection = db.collection(env.STATS_COLLECTION);

/**
 * 
 * @returns 
 * {
 *  isFormOpen: boolean;
 *  currentRegistrations: number; // 0
 *  maxRegistrations: number; // 150
 *  lastUpdated: string;
 * }
 */


export const getRegisterStats = async (
  _: Request,
  res: Response,
): Promise<void> => {

  try {
    let docRef = await collection.doc("registrations").get();

    if (!docRef.exists) {
      res.status(404).json({ status: false, error: "Stats not found" });
      return;
    }

    const statsData = docRef.data();
    if (!statsData) {
      res.status(404).json({ status: false, error: "Stats not found" });
      return;
    }

    res.status(200).json({
      status: true,
      data: statsData
    });

  } catch (error) {
    console.error("Error fetching register stats:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    })
  }
};

// return true, false

export const updateRegCount = async (): Promise<boolean> => {
  try {
    const docRef = await collection.doc("registrations").get();

    if (!docRef.exists) {
      console.log("Stats not found");
      return false;
    }

    const statsData = docRef.data();
    if (!statsData) {
      console.log("Stats not found");
      return false;
    }
    
    const currentCount = statsData.currentRegistrations || 0;

    collection.doc("registrations").update({
      currentRegistrations: currentCount + 1,
      lastUpdated: new Date().toISOString(),
    })
      .then(() => {
        return true;
      })
      .catch((error) => {
        console.error("Error updating registration count:", error);
        return false;
      });
    return true;

  } catch (error) {
    console.error("Error updating registration count:", error);
    return false;
  }
}
