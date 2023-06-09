import { Document, model, Model, Schema } from "mongoose";
import m2s from "mongoose-to-swagger";

export interface Car {
  brand: string;
  model: string;
  year: number;
  color: string;
  price: number;
}

export interface CarDocument extends Car, Document {}

const CarSchema = new Schema<CarDocument>({
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
    max: new Date().getFullYear(),
    min: 1900,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

export type CarModel = Model<CarDocument>;
export const carModel: CarModel = model<CarDocument, CarModel>(
  "cars",
  CarSchema
);
export const carSchema = m2s(carModel, { omitFields: ["_id"] });
