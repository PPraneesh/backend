import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { env } from "./config/env";
import dataRoute from "./routes/stats.route";
import registerRoute from "./routes/register.route";
import feedbackRoute from "./routes/feedback.route";
import { postLogin } from "./routes/admin.route";
import expressAsyncHandler from "express-async-handler";
import { requireAuth } from "./utils/middleware";
import { toggleFormStatus } from "./controllers/stats.controller";

const app = express();

app.use(
  cors({
    origin: [env.FRONTEND_URL, env.ADMIN_URL],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.post("/auth", expressAsyncHandler(postLogin));
app.put("/toggleFormStatus", requireAuth, expressAsyncHandler(toggleFormStatus));
app.use("/data", dataRoute);
app.use("/register", registerRoute);
app.use("/feedback", feedbackRoute);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(401).json({ success: false, message: err.message });
});

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
