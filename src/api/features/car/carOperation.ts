import express from "express";
import { Car, CarModel } from "./carModel";

interface CarRequestHandler {
  (
    this: { dependencies: { carModel: CarModel } },
    req: express.Request<
      { id: string },
      Car,
      Car,
      { filter: Record<string, string>; sort: string[] }
    >,
    res: express.Response,
    next: express.NextFunction
  ): void;
}

const checkCarExists: CarRequestHandler = async function (req, res, next) {
  const carExists = await this.dependencies.carModel
    .countDocuments({ _id: req.params.id })
    .exec();
  if (carExists) {
    next();
  } else {
    res.status(404).json({ message: "Car not found" });
  }
};

export const carOperation: Record<string, CarRequestHandler[]> = {
  getCars: [
    async function (req, res) {
      const cars = await this.dependencies.carModel
        .find(req.query?.filter)
        .sort(
          Array.isArray(req.query?.sort)
            ? req.query.sort.join(" ")
            : req.query?.sort
        )
        .exec();
      if (cars.length) {
        res.json(cars);
      } else {
        res.status(404).json({ message: "Cars not found" });
      }
    },
  ],

  createCar: [
    async function (req, res) {
      const car = await this.dependencies.carModel.create(req.body);
      res.status(201).json(car);
    },
  ],

  getCarById: [
    checkCarExists,
    async function (req, res) {
      const car = await this.dependencies.carModel
        .findById(req.params.id)
        .exec();
      res.json(car);
    },
  ],

  updateCarById: [
    checkCarExists,
    async function (req, res) {
      const car = await this.dependencies.carModel
        .findByIdAndUpdate(req.params.id, req.body)
        .exec();
      res.json(car);
    },
  ],

  deleteCarById: [
    checkCarExists,
    async function (req, res) {
      await this.dependencies.carModel.findByIdAndDelete(req.params.id).exec();
      res.sendStatus(204);
    },
  ],
};
