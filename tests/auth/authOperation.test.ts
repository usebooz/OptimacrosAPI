import request from "supertest";
import express from "express";
import {
  authHandler,
  authOperation,
  UserDocument,
  userModel,
} from "../../src/api/features/auth";

jest.mock("jsonwebtoken", () => {
  return {
    sign: jest.fn((payload, secret, options) => ({
      username: payload.username,
      secret: secret,
      expiresIn: options.expiresIn,
    })),
    verify: jest.fn((token, secret, options) => {
      if (token !== secret) {
        throw new Error("Invalid token");
      }
      if (options.clockTimestamp > Number(process.env.EXPIRES_IN)) {
        throw new Error("Token expired");
      }
    }),
  };
});
jest.mock("../../src/api/features/auth", () => {
  const originalModule = jest.requireActual("../../src/api/features/auth");
  let persistentUsers: UserDocument[];

  return {
    ...originalModule,
    userModel: {
      create: jest.fn((user) => {
        persistentUsers.push(user);
        return user;
      }),
      countDocuments: jest.fn((user) => ({
        exec: jest.fn(() =>
          persistentUsers.some(
            (persistentUser) => persistentUser.username === user.username
          )
        ),
      })),
      login: jest.fn((username, password) => {
        const user = persistentUsers.find(
          (persistentUser) =>
            persistentUser.username === username &&
            persistentUser.password === password
        );
        return user ? user : null;
      }),
      deleteMany: jest.fn(() => {
        persistentUsers = [];
      }),
    },
  };
});

describe("Auth operation", () => {
  let app: express.Express;

  beforeAll(async () => {
    process.env.USERNAME = "username";
    process.env.PASSWORD = "password";
    process.env.SECRET = "secret";
    process.env.EXPIRES_IN = "1";

    app = express();
    app.use(express.json());
    app.post(
      "/signup",
      authOperation.login[0].bind({ dependencies: { userModel } }),
      (req, res) => {
        res.sendStatus(200);
      }
    );
    app.post(
      "/sign",
      authOperation.login[1].bind({ dependencies: { userModel } })
    );
    app.get("/verify", (req, res) => {
      const isVerified = authHandler(req, [], {
        type: "http",
        scheme: "Bearer",
      });
      if (isVerified) {
        res.sendStatus(200);
      } else {
        res.sendStatus(401);
      }
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    userModel.deleteMany();
  });

  it("signup if user does not exist should create user", async () => {
    await request(app).post("/signup").expect(200);
    expect(userModel.create).toHaveBeenCalledTimes(1);
    expect(
      userModel.countDocuments({ username: process.env.USERNAME }).exec()
    ).toBeTruthy();
  });

  it("signup if user exists should do nothing", async () => {
    await userModel.create({
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    });
    jest.mocked(userModel.create).mockClear();
    await request(app).post("/signup").expect(200);
    expect(userModel.create).toHaveBeenCalledTimes(0);
  });

  it("sign with invalid credentials should be failed", async () => {
    await request(app)
      .post("/sign")
      .send({ username: "test", password: "test" })
      .set("Accept", "application/json")
      .expect(401);
  });

  it("sign with valid credentials should be successful", async () => {
    await userModel.create({
      username: "test",
      password: "test",
    });
    await request(app)
      .post("/sign")
      .send({ username: "test", password: "test" })
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .expect({
        token: {
          username: "test",
          secret: process.env.SECRET,
          expiresIn: process.env.EXPIRES_IN,
        },
      });
  });

  it("verify with valid token should be successful", async () => {
    process.env.EXPIRES_IN = (Date.now() / 1000 + 3600).toString();
    await request(app)
      .get("/verify")
      .set("Authorization", `Bearer ${process.env.SECRET}`)
      .expect(200);
  });

  it("verify with invalid token should be failed", async () => {
    await request(app)
      .get("/verify")
      .set("Authorization", `Bearer invalid`)
      .expect(401);
  });

  it("verify with expired token should be failed", async () => {
    process.env.EXPIRES_IN = (Date.now() / 1000 - 3600).toString();
    await request(app)
      .get("/verify")
      .set("Authorization", `Bearer ${process.env.SECRET}`)
      .expect(401);
  });
});
