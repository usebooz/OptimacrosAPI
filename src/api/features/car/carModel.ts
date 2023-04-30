import { Document, Schema, model, Model } from "mongoose";
import m2s from "mongoose-to-swagger";

export interface Car {
  brand: string;
  model: string;
  year: number;
  color: string;
  price: number;
}

interface CarDocument extends Car, Document {}

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
    maxlength: new Date().getFullYear(),
    minlength: 1900,
  },
  price: {
    type: Number,
    required: true,
  },
});

export type CarModel = Model<CarDocument>;
export const carModel: CarModel = model<CarDocument, CarModel>(
  "cars",
  CarSchema
);
export const carSchema = m2s(carModel, { omitFields: ["_id"] });
