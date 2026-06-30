import { Router } from 'express';
import { getStores, getStoreFoodItems } from '../controllers/store.controller';

const router = Router();

router.get('/', getStores);
router.get('/:storeId/food-items', getStoreFoodItems);

export default router;
