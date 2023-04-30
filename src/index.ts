import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";

import * as openapi from "express-openapi";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";

import { commonMiddleware } from "./common";
import { apiDoc } from "./api/api-doc";
import { carModel, carOperation } from "./api/features/car";
import { userModel, authOperation, authHandler } from "./api/features/auth";

dotenv.config();
const app = express();

main().then(() => console.log(`API is listening on port ${process.env.PORT}`));

async function main() {
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL must be defined");
  }

  mongoose.set("returnOriginal", false);
  await mongoose.connect(process.env.MONGODB_URL);

  app.use(cors());
  app.use(morgan("combined"));

  await openapi.initialize({
    app,
    logger: console,
    apiDoc: {
      ...apiDoc,
      "x-express-openapi-additional-middleware": [
        commonMiddleware.validateAllResponses,
      ],
    },
    routesGlob: "**/*.{ts,js}",
    routesIndexFileRegExp: /(?:index)?\.[tj]s$/,
    enableObjectCoercion: true,
    consumesMiddleware: { "application/json": bodyParser.json() },
    errorMiddleware: commonMiddleware.sendValidationError,
    securityHandlers: { BearerAuth: authHandler },
    dependencies: {
      carModel: carModel,
      userModel: userModel,
    },
    operations: {
      ...carOperation,
      ...authOperation,
    },
  });

  app.listen(process.env.PORT);
}
