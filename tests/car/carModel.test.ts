import mongoose from "mongoose";
import { Car, carModel } from "../../src/api/features/car";

describe("Car model", () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });
  beforeEach(async () => {
    await carModel.deleteMany({});
  });

  const validCar: Car = {
    brand: "Ford",
    model: "Fiesta",
    year: 2023,
    color: "red",
    price: 1000,
  };

  const createCar = async (car: Car | object): Promise<Car | Error> => {
    try {
      return await carModel.create(car);
    } catch (error) {
      return error as Error;
    }
  };

  it("create valid car should be successful", async () => {
    const newCar = (await createCar(validCar)) as Car;
    expect(newCar).toMatchObject(validCar);
    expect(newCar).toHaveProperty("_id");
  });

  it("create 2 valid cars with the same data should be successful", async () => {
    await createCar(validCar);
    const newCar = (await createCar(validCar)) as Car;
    expect(newCar).toMatchObject(validCar);
    expect(newCar).toHaveProperty("_id");
  });

  it("create car without required fields should be failed", async () => {
    const error = (await createCar({})) as mongoose.Error.ValidationError;
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error?.errors).toHaveProperty("brand");
    expect(error?.errors).toHaveProperty("model");
    expect(error?.errors).toHaveProperty("year");
    expect(error?.errors).toHaveProperty("color");
    expect(error?.errors).toHaveProperty("price");
  });

  it("create car with a year more than the current should be failed", async () => {
    const car = { ...validCar, year: new Date().getFullYear() + 1 };
    const error = (await createCar(car)) as mongoose.Error.ValidationError;
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error?.errors).toHaveProperty("year");
  });

  it("create car with a year less than 1900 should be failed", async () => {
    const car = { ...validCar, year: 1899 };
    const error = (await createCar(car)) as mongoose.Error.ValidationError;
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error?.errors).toHaveProperty("year");
  });

  it("create car with a negative price should be failed", async () => {
    const car = { ...validCar, price: -1 };
    const error = (await createCar(car)) as mongoose.Error.ValidationError;
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error?.errors).toHaveProperty("price");
  });
});
