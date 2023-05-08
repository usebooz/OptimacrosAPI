import mongoose from "mongoose";
import express from "express";

import * as openapi from "express-openapi";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";

import { commonMiddleware } from "./common";
import { carModel, carOperation } from "./api/features/car";
import { authHandler, authOperation, userModel } from "./api/features/auth";

export default async function (mongoUrl: string | undefined) {
  if (!mongoUrl) {
    throw new Error("MONGODB_URL must be defined");
  }

  const app = express();

  mongoose.set("returnOriginal", false);
  await mongoose.connect(mongoUrl);

  app.use(cors());
  app.use(morgan("combined"));

  await openapi.initialize({
    app,
    logger: console,
    apiDoc: {
      ...(await import("./api/api-doc")).apiDoc,
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

  return app;
}
