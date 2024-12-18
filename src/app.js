import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true })); //CORS Setup

app.use(express.json({ limit: "20kb" })); // JSON Setup

app.use(express.urlencoded({ limit: "20kb", extended: true })); //URL Setup

app.use(express.static("public")); //STATIC Setup

app.use(cookieParser()); // Cookie-parser Setup

///Routes
app.use("/api/user", userRoutes);

export { app };
