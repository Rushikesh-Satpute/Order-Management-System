import { z } from 'zod';

// Order item schema
const orderItemSchema = z.object({
  item_id: z.string().min(1, 'Item ID is required'),
  qty: z.number().int().min(1, 'Quantity must be at least 1'),
});

// Create order schema
export const createOrderSchema = z.object({
  store_id: z.string().min(1, 'Store ID is required'),
  items: z
    .array(orderItemSchema)
    .min(1, 'Order must have at least one item'),
});

// Update order status schema
export const updateOrderStatusSchema = z.object({
  status: z.enum(['PLACED', 'PREPARING', 'COMPLETED'], {
    errorMap: () => ({
      message: 'Status must be PLACED, PREPARING, or COMPLETED',
    }),
  }),
});

// Query schema for fetching orders
export const getOrdersQuerySchema = z.object({
  store_id: z.string().optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

// Type exports
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
