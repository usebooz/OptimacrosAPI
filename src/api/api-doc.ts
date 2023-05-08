import { OpenAPIV3 } from "openapi-types";

import { carSchema } from "./features/car";
import { userSchema } from "./features/auth";

export const apiDoc: OpenAPIV3.Document = {
  openapi: "3.1.0",
  servers: [
    {
      url: `${process.env.SCHEME}://${process.env.HOST}:${process.env.PORT}/api`,
    },
  ],
  info: {
    title: "Optimacros API",
    version: "1.0.0",
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Car: carSchema,
      User: userSchema,
      Token: {
        type: "object",
        required: ["token"],
        properties: {
          token: { type: "string" },
        },
      },
      Error: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string" },
        },
      },
    },
    parameters: {
      carId: {
        in: "path",
        name: "id",
        required: true,
        schema: {
          type: "string",
          pattern: `^[0-9a-fA-F]{24}$`,
        },
      },
      carFilter: {
        in: "query",
        name: "filter",
        style: "deepObject",
        schema: {
          type: "object",
          properties: carSchema.propeies,
        },
        explode: false,
      },
      carSort: {
        in: "query",
        name: "sort",
        schema: {
          type: "array",
          uniqueItems: true,
          items: {
            type: "string",
            enum: [
              ...Object.keys(carSchema.properties),
              ...Object.keys(carSchema.properties).map((key) => `-${key}`),
            ],
          },
        },
      },
    },
    requestBodies: {
      Car: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Car" },
          },
        },
      },
      User: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/User" },
          },
        },
      },
    },
    responses: {
      NoContent: {
        description: "The specified resource was deleted",
      },
      Error: {
        description: "The specified resource was not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      Token: {
        description: "Token was obtained",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Token",
            },
          },
        },
      },
      Car: {
        description: "Car was obtained",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Car" },
          },
        },
      },
      Cars: {
        description: "Cars were obtained",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: { $ref: "#/components/schemas/Car" },
            },
          },
        },
      },
    },
  },
  paths: {
    "/login": {
      post: {
        description: "Login user",
        operationId: "login",
        tags: ["auth"],
        requestBody: { $ref: "#/components/requestBodies/User" },
        responses: {
          200: { $ref: "#/components/responses/Token" },
          401: { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/cars": {
      get: {
        description: "Get a list of cars",
        operationId: "getCars",
        tags: ["cars"],
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/carFilter" },
          { $ref: "#/components/parameters/carSort" },
        ],
        responses: {
          200: { $ref: "#/components/responses/Cars" },
          404: { $ref: "#/components/responses/Error" },
        },
      },
      post: {
        description: "Create a car",
        operationId: "createCar",
        tags: ["cars"],
        security: [{ BearerAuth: [] }],
        requestBody: { $ref: "#/components/requestBodies/Car" },
        responses: {
          201: { $ref: "#/components/responses/Car" },
        },
      },
    },
    "/cars/{id}": {
      get: {
        description: "Get car by id",
        operationId: "getCarById",
        tags: ["cars"],
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/carId" }],
        responses: {
          200: { $ref: "#/components/responses/Car" },
          404: { $ref: "#/components/responses/Error" },
        },
      },
      patch: {
        description: "Update car by id",
        operationId: "updateCarById",
        tags: ["cars"],
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/carId" }],
        requestBody: { $ref: "#/components/requestBodies/Car" },
        responses: {
          200: { $ref: "#/components/responses/Car" },
          404: { $ref: "#/components/responses/Error" },
        },
      },
      delete: {
        description: "Delete car by id",
        operationId: "deleteCarById",
        tags: ["cars"],
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/carId" }],
        responses: {
          204: { $ref: "#/components/responses/NoContent" },
          404: { $ref: "#/components/responses/Error" },
        },
      },
    },
  },
};
