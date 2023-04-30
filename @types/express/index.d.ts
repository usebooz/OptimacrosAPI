import { OpenAPIV3_1 } from "openapi-types";
import { IOpenAPIResponseValidator } from "openapi-response-validator";

declare global {
  namespace Express {
    interface Request {
      apiDoc: OpenAPIV3_1.Document;
    }

    interface Response extends IOpenAPIResponseValidator {}
  }
}
