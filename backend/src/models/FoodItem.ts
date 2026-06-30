import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodItem extends Document {
  food_id: string;
  name: string;
  category: string;
  price: number;
}

const foodItemSchema = new Schema<IFoodItem>(
  {
    food_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const FoodItem = mongoose.model<IFoodItem>('FoodItem', foodItemSchema);
