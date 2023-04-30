import { Document, Schema, model, Model } from "mongoose";
import m2s from "mongoose-to-swagger";

export interface Car {
  brand: string;
  model: string;
  year: number;
  color: string;
  price: number;
}

export interface CarDocument extends Car, Document {}

export type CarModel = Model<CarDocument>;

export const carsModel: CarModel = model<CarDocument, CarModel>(
  "cars",
  new Schema({
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
      maxlength: new Date().getFullYear(),
      minlength: 1900,
    },
    price: {
      type: Number,
      required: true,
    },
  })
);

export const carsSchema = m2s(carsModel, { omitFields: ["_id"] });
