import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreFoodItem extends Document {
  store_id: string;
  food_items: string[];
}

const storeFoodItemSchema = new Schema<IStoreFoodItem>(
  {
    store_id: { type: String, required: true, unique: true },
    food_items: [{ type: String, required: true }],
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const StoreFoodItem = mongoose.model<IStoreFoodItem>(
  'StoreFoodItem',
  storeFoodItemSchema
);
