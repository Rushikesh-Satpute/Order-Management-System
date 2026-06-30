import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  item_id: string;
  qty: number;
}

export interface IOrder extends Document {
  store_id: string;
  items: IOrderItem[];
  total_amount: number;
  status: 'PLACED' | 'PREPARING' | 'COMPLETED';
  created_at: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    item_id: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    store_id: { type: String, required: true, index: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: 'Order must have at least one item',
      },
    },
    total_amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['PLACED', 'PREPARING', 'COMPLETED'],
      default: 'PLACED',
    },
    created_at: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const Order = mongoose.model<IOrder>('Order', orderSchema);
