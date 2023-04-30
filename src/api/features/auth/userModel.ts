import { Document, Schema, model, Model } from "mongoose";
import m2s from "mongoose-to-swagger";
import * as bcrypt from "bcrypt";

export interface User {
  username: string;
  password: string;
}

interface UserDocument extends User, Document {}

const UserSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});
UserSchema.pre<UserDocument>("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
UserSchema.statics.login = async function (
  this: Model<UserDocument>,
  username: string,
  password: string
) {
  const user = await this.findOne({ username });
  if (!user) {
    return null;
  }
  const isAuthenticated = await bcrypt.compare(password, user.password);
  if (!isAuthenticated) {
    return null;
  }
  return user;
};

export interface UserModel extends Model<UserDocument> {
  login(username?: string, password?: string): Promise<User | null>;
}

export const userModel: UserModel = model<UserDocument, UserModel>(
  "users",
  UserSchema
);

export const userSchema = m2s(userModel, { omitFields: ["_id"] });
