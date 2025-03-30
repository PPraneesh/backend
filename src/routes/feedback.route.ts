import express, { Router } from "express";
import { submitFeedback } from "../controllers/feedback.controller";

const feedbackRoute: Router = express.Router();

feedbackRoute.post("/", submitFeedback);

export default feedbackRoute;
