import express, { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import {
  getRegisterStats,
} from "../controllers/stats.controller";
import { requireAuth } from "../utils/middleware";
import { getAllParticipants } from "../controllers/register.controller";

const dataRoute: Router = express.Router();

dataRoute.get("/registrations", requireAuth, expressAsyncHandler(getAllParticipants));
dataRoute.get("/stats", expressAsyncHandler(getRegisterStats));

export = dataRoute;
