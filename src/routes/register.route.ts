import express, { Router } from "express";
import { submitForm } from "../controllers/register.controller";

const registerRoute: Router = express.Router();

registerRoute.post("/", submitForm);

export default registerRoute;
