import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/order.controller';
import { validate, validateQuery } from '../middlewares/validate';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  getOrdersQuerySchema,
} from '../schemas/order.schema';

const router = Router();

router.post('/', validate(createOrderSchema), createOrder);
router.get('/', validateQuery(getOrdersQuerySchema), getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
