import express from "express";
import jwt from "jsonwebtoken";
import { SecurityHandler } from "openapi-security-handler";

import { User, UserModel } from "./userModel";

interface AuthRequestHandler {
  (
    this: { dependencies: { userModel: UserModel } },
    req: express.Request<undefined, User, User, undefined>,
    res: express.Response,
    next: express.NextFunction
  ): void;
}

const createUser: AuthRequestHandler = async function (req, res, next) {
  const userExists = await this.dependencies.userModel
    .countDocuments({ username: process.env.USERNAME })
    .exec();
  if (!userExists) {
    await new this.dependencies.userModel({
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    }).save();
  }
  next();
};

export const authOperation: Record<string, AuthRequestHandler[]> = {
  login: [
    createUser,
    async function (req, res) {
      const user = await this.dependencies.userModel.login(
        req.body.username,
        req.body.password
      );
      if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }
      const token = jwt.sign(
        { username: user.username },
        process.env.SECRET || "",
        { expiresIn: process.env.EXPIRES_IN }
      );
      res.json({ token });
    },
  ],
};

export const authHandler: SecurityHandler = async function (req) {
  const headers = <{ authorization?: string }>req.headers;
  const token = headers.authorization?.replace(/^Bearer /, "") || "";
  try {
    jwt.verify(token, process.env.SECRET || "");
    return true;
  } catch {
    return false;
  }
};
