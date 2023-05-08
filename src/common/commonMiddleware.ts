import { ErrorRequestHandler, RequestHandler } from "express";

const validateAllResponses: RequestHandler = (req, res, next) => {
  const json = res.json;

  res.json = (body) => {
    const isError = !!res.get("x-express-openapi-validation-error-for");
    const error =
      !isError && res.validateResponse(res.statusCode.toString(), body);
    if (error) {
      res.set(
        "x-express-openapi-validation-error-for",
        res.statusCode.toString()
      );
      next(error);
      return res;
    }
    return json.call(res, body);
  };
  next();
};

const sendValidationError: ErrorRequestHandler = (err, req, res, next) => {
  const status = Number(err.status) || 500;
  const error = err.message
    ? err
    : err.errors?.length
    ? { message: `${err.errors[0].path} ${err.errors[0].message}` }
    : { message: "Internal server error" };
  res.status(status).json(error);
  next();
};

export const commonMiddleware = { validateAllResponses, sendValidationError };
