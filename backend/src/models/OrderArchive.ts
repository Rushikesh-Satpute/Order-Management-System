import mongoose, { Schema, Document } from 'mongoose';
import { IOrderItem } from './Order';

export interface IOrderArchive extends Document {
  store_id: string;
  items: IOrderItem[];
  total_amount: number;
  status: 'PLACED' | 'PREPARING' | 'COMPLETED';
  created_at: Date;
  archived_at: Date;
}

const orderItemSchema = new Schema(
  {
    item_id: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderArchiveSchema = new Schema<IOrderArchive>(
  {
    store_id: { type: String, required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    total_amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['PLACED', 'PREPARING', 'COMPLETED'],
      required: true,
    },
    created_at: { type: Date, required: true, index: true },
    archived_at: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const OrderArchive = mongoose.model<IOrderArchive>(
  'OrderArchive',
  orderArchiveSchema
);
