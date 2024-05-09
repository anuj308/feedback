import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("uploads"));
app.use(cookieParser());

// import routes
import userRouter from "./routes/user.route.js";
import formRouter from "./routes/form.routes.js"

// routes declaration
app.use("/api/v1/user", userRouter);
app.use("/api/v1/form", formRouter);

export { app };
