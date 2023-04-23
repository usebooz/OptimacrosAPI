import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import { apiRouter } from "./routes";

dotenv.config();
if (!process.env.MONGODB_URL) {
  throw new Error("MONGODB_URL must be defined");
}

mongoose.connect(process.env.MONGODB_URL).catch((err) => {
  throw new Error(err);
});

mongoose.connection.once("open", () => {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cors());
  app.use(morgan("combined"));

  app.use("/api", apiRouter);

  app.listen(process.env.OPTIMACROS_PORT, () => {
    console.log(`Optimacros API is listening on port ${process.env.PORT}`);
  });
});
