import express from "express";
import { Car, CarModel } from "./carsModel";

interface CarRequestHandler {
  (
    this: { dependencies: { carsModel: CarModel } },
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
  const carExists = await this.dependencies.carsModel
    .countDocuments({ _id: req.params.id })
    .exec();
  if (carExists) {
    next();
  } else {
    res.status(404).json({ message: "Car not found" });
  }
};

export const carsOperation: Record<string, CarRequestHandler[]> = {
  getCars: [
    async function (req, res) {
      const cars = await this.dependencies.carsModel
        .find(req.query.filter)
        .sort(req.query?.sort.join(" "))
        .exec();
      res.json(cars);
    },
  ],

  createCar: [
    async function (req, res) {
      const car = await this.dependencies.carsModel.create(req.body);
      res.status(201).json(car);
    },
  ],

  getCarById: [
    checkCarExists,
    async function (req, res) {
      const car = await this.dependencies.carsModel
        .findById(req.params.id)
        .exec();
      res.json(car);
    },
  ],

  updateCarById: [
    checkCarExists,
    async function (req, res) {
      const car = await this.dependencies.carsModel
        .findByIdAndUpdate(req.params.id, req.body)
        .exec();
      res.json(car);
    },
  ],

  deleteCarById: [
    checkCarExists,
    async function (req, res) {
      await this.dependencies.carsModel.findByIdAndDelete(req.params.id).exec();
      res.sendStatus(204);
    },
  ],
};
