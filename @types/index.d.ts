import { Mongo } from "@shelf/jest-mongodb/lib";

declare global {
  let __MONGOD__: Mongo;
  let __MONGO_URI__: string;
  let __MONGO_DB_NAME__: string;
}
