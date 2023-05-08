import request from "supertest";
import express from "express";
import {
  CarDocument,
  carModel,
  carOperation,
} from "../../src/api/features/car";

jest.mock("../../src/api/features/car", () => {
  const originalModule = jest.requireActual("../../src/api/features/car");
  let persistentCars: CarDocument[];

  return {
    ...originalModule,
    carModel: {
      create: jest.fn((car) => {
        persistentCars.push(car);
        return car;
      }),
      countDocuments: jest.fn((car) => ({
        exec: jest.fn(() =>
          persistentCars.some((persistentCar) => persistentCar._id === car._id)
        ),
      })),
      deleteMany: jest.fn(() => {
        persistentCars = [];
      }),
      find: jest.fn((filter) => ({
        sort: jest.fn((sort) => ({
          exec: () =>
            persistentCars
              .filter((car) => !filter || car.brand === filter)
              .sort((a, b) => (sort ? sort * (a.price - b.price) : 0)),
        })),
      })),
      findById: jest.fn((id) => ({
        exec: () => persistentCars.find((car) => car._id === id),
      })),
      findByIdAndUpdate: jest.fn((id, car) => ({
        exec: () => {
          persistentCars = persistentCars.map((persistentCar) =>
            persistentCar._id === id
              ? { ...persistentCar, ...car }
              : persistentCar
          );
          return car;
        },
      })),
      findByIdAndDelete: jest.fn((id) => ({
        exec: () => {
          persistentCars = persistentCars.filter((car) => car._id !== id);
        },
      })),
    },
  };
});

describe("Car operation", () => {
  let app: express.Express;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.get(
      "/get",
      carOperation.getCars[0].bind({ dependencies: { carModel } })
    );
    app.post(
      "/create",
      carOperation.createCar[0].bind({ dependencies: { carModel } })
    );
    app.get(
      `/check/:id`,
      carOperation.getCarById[0].bind({ dependencies: { carModel } }),
      (req, res) => {
        res.sendStatus(200);
      }
    );
    app.get(
      "/get/:id",
      carOperation.getCarById[1].bind({ dependencies: { carModel } })
    );
    app.patch(
      "/update/:id",
      carOperation.updateCarById[1].bind({ dependencies: { carModel } })
    );
    app.delete(
      "/delete/:id",
      carOperation.deleteCarById[1].bind({ dependencies: { carModel } })
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    carModel.deleteMany();
  });

  it("get all cars should be successful", async () => {
    const cars = [
      await carModel.create({ _id: "1", brand: "brand1", price: 1000 }),
      await carModel.create({ _id: "2", brand: "brand2", price: 2000 }),
    ];
    await request(app).get("/get").expect(200).expect(cars);
  });

  it("get cars with not existing brand should be failed", async () => {
    await carModel.create({ _id: "1", brand: "brand", price: 1000 });
    await request(app).get("/get?filter=test").expect(404);
  });

  it("get cars with existing brand should be successful", async () => {
    const cars = [
      await carModel.create({ _id: "1", brand: "brand1", price: 1000 }),
      await carModel.create({ _id: "2", brand: "brand2", price: 2000 }),
    ];
    await request(app).get("/get?filter=brand1").expect(200).expect([cars[0]]);
  });

  it("get cars with ascending sort price should be successful", async () => {
    const cars = [
      await carModel.create({ _id: "1", brand: "brand1", price: 3000 }),
      await carModel.create({ _id: "2", brand: "brand2", price: 1000 }),
      await carModel.create({ _id: "3", brand: "brand3", price: 2000 }),
    ];
    await request(app)
      .get("/get?sort=1")
      .expect(200)
      .expect(cars.sort((a, b) => a.price - b.price));
  });

  it("get cars with descending sort price should be successful", async () => {
    const cars = [
      await carModel.create({ _id: "1", brand: "brand1", price: 3000 }),
      await carModel.create({ _id: "2", brand: "brand2", price: 1000 }),
      await carModel.create({ _id: "3", brand: "brand3", price: 2000 }),
    ];
    await request(app)
      .get("/get?sort=-1")
      .expect(200)
      .expect(cars.sort((a, b) => b.price - a.price));
  });

  it("get cars filter and sort should be successful", async () => {
    const cars = [
      await carModel.create({ _id: "1", brand: "brand1", price: 3000 }),
      await carModel.create({ _id: "2", brand: "brand2", price: 1000 }),
      await carModel.create({ _id: "3", brand: "brand2", price: 2000 }),
    ];
    await request(app)
      .get("/get?filter=brand2&sort=-1")
      .expect(200)
      .expect([cars[2], cars[1]]);
  });

  it("create car should be successful", async () => {
    await request(app)
      .post("/create")
      .send({ _id: "1", brand: "brand" })
      .set("Accept", "application/json")
      .expect(201)
      .expect({ _id: "1", brand: "brand" });
    expect(carModel.countDocuments({ _id: "1" }).exec()).toBeTruthy();
  });

  it("check existing car should be successful", async () => {
    await carModel.create({ _id: "1" });
    await request(app).get("/check/1").expect(200);
  });

  it("check not existing car should be failed", async () => {
    await carModel.create({ _id: "1" });
    await request(app).get("/check/2").expect(404);
  });

  it("get car by id should be successful", async () => {
    await carModel.create({ _id: "1", brand: "brand" });
    await request(app)
      .get("/get/1")
      .expect(200)
      .expect({ _id: "1", brand: "brand" });
  });

  it("update car by id should be successful", async () => {
    await carModel.create({ _id: "1", brand: "brand" });
    await request(app)
      .patch("/update/1")
      .set("Accept", "application/json")
      .send({ brand: "new brand" })
      .expect(200)
      .expect({ brand: "new brand" });
    expect(carModel.findById("1").exec()).toMatchObject({ brand: "new brand" });
  });

  it("delete car by id should be successful", async () => {
    await carModel.create({ _id: "1" });
    await request(app).delete("/delete/1").expect(204);
    expect(carModel.countDocuments({ _id: "1" }).exec()).toBeFalsy();
  });
});
