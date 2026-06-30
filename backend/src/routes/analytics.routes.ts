import { Router } from 'express';
import {
  getOrdersPerDay,
  getRevenuePerStore,
  getTopItems,
} from '../controllers/analytics.controller';
import { archiveOldOrders } from '../controllers/archive.controller';

const router = Router();

router.get('/orders-per-day', getOrdersPerDay);
router.get('/revenue-per-store', getRevenuePerStore);
router.get('/top-items', getTopItems);
router.post('/archive-old-orders', archiveOldOrders);

export default router;
