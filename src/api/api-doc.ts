import { carsSchema } from "./features/cars/carsModel";
import { OpenAPIV3 } from "openapi-types";

export const apiDoc: OpenAPIV3.Document = {
  openapi: "3.1.0",
  servers: [{ url: "/api" }],
  info: {
    title: "Optimacros API",
    version: "1.0.0",
  },
  components: {
    schemas: {
      Car: carsSchema,
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
        required: true,
        style: "deepObject",
        schema: {
          type: "object",
          required: ["brand"],
          properties: carsSchema.properties,
        },
        explode: true,
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
              ...Object.keys(carsSchema.properties),
              ...Object.keys(carsSchema.properties).map((key) => `-${key}`),
            ],
          },
        },
      },
    },
    requestBodies: {
      Car: {
        required: true,
        content: {
          "application/json": { schema: { $ref: "#/components/schemas/Car" } },
        },
      },
    },
    responses: {
      NotFound: {
        description: "The specified resource was not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      NoContent: {
        description: "The specified resource was deleted",
      },
      Car: {
        description: "Car was obtained",
        content: {
          "application/json": { schema: { $ref: "#/components/schemas/Car" } },
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
    "/cars": {
      get: {
        description: "Get a list of cars",
        operationId: "getCars",
        tags: ["cars"],
        parameters: [
          { $ref: "#/components/parameters/carFilter" },
          { $ref: "#/components/parameters/carSort" },
        ],
        responses: {
          200: { $ref: "#/components/responses/Cars" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      post: {
        description: "Create a car",
        operationId: "createCar",
        tags: ["cars"],
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
        parameters: [{ $ref: "#/components/parameters/carId" }],
        responses: {
          200: { $ref: "#/components/responses/Car" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        description: "Update car by id",
        operationId: "updateCarById",
        tags: ["cars"],
        parameters: [{ $ref: "#/components/parameters/carId" }],
        requestBody: { $ref: "#/components/requestBodies/Car" },
        responses: {
          200: { $ref: "#/components/responses/Car" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        description: "Delete car by id",
        operationId: "deleteCarById",
        tags: ["cars"],
        parameters: [{ $ref: "#/components/parameters/carId" }],
        responses: {
          204: { $ref: "#/components/responses/NoContent" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
};
