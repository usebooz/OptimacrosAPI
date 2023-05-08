import mongoose from "mongoose";
import { User, userModel } from "../../src/api/features/auth";

jest.mock("bcrypt", () => {
  return {
    hash: jest.fn((password: string) => password.split("").reverse().join("")),
    compare: jest.fn(
      (password, hash) => password.split("").reverse().join("") === hash
    ),
  };
});

describe("User model", () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });
  beforeEach(async () => {
    jest.clearAllMocks();
    await userModel.deleteMany({});
  });

  const validUser: User = {
    username: "admin",
    password: "admin",
  };

  const createUser = async (user: User | object): Promise<User | Error> => {
    try {
      return await userModel.create(user);
    } catch (error) {
      return error as Error;
    }
  };

  it("create valid user should be successful", async () => {
    const newUser = (await createUser(validUser)) as User;
    expect(newUser.username).toBe(validUser.username);
    expect(newUser.password).toBe("nimda");
    expect(newUser).toHaveProperty("_id");
  });

  it("create 2 valid user with the same username should be failed", async () => {
    await createUser(validUser);
    const error = await createUser(validUser);
    expect(error).toBeInstanceOf(Error);
  });

  it("create user without required fields should be failed", async () => {
    const error = (await createUser({})) as mongoose.Error.ValidationError;
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error?.errors).toHaveProperty("username");
    expect(error?.errors).toHaveProperty("password");
  });

  it("login with valid credentials should be successful", async () => {
    await createUser(validUser);
    const user = (await userModel.login(
      validUser.username,
      validUser.password
    )) as User;
    expect(user.username).toBe(validUser.username);
  });

  it("login with wrong username should be failed", async () => {
    await createUser(validUser);
    const user = await userModel.login("test", validUser.password);
    expect(user).toBeNull();
  });

  it("login with wrong password should be failed", async () => {
    await createUser(validUser);
    const user = await userModel.login(validUser.username, "test");
    expect(user).toBeNull();
  });
});
