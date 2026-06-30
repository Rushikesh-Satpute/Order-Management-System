import mongoose, { Schema, Document } from 'mongoose';

export interface IStore extends Document {
  store_id: string;
  name: string;
  type: string;
}

const storeSchema = new Schema<IStore>(
  {
    store_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const Store = mongoose.model<IStore>('Store', storeSchema);
