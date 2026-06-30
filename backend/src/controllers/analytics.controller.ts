import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { Store } from '../models/Store';
import { FoodItem } from '../models/FoodItem';

// GET /analytics/orders-per-day
export const getOrdersPerDay = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /analytics/revenue-per-store
export const getRevenuePerStore = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: '$store_id',
          totalRevenue: { $sum: '$total_amount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      {
        $project: {
          _id: 0,
          store_id: '$_id',
          totalRevenue: 1,
          orderCount: 1,
        },
      },
    ]);

    // attach store names
    const storeIds = result.map((r) => r.store_id);
    const stores = await Store.find({ store_id: { $in: storeIds } }).lean();
    const storeMap = new Map(stores.map((s) => [s.store_id, s.name]));

    const enriched = result.map((r) => ({
      ...r,
      store_name: storeMap.get(r.store_id) || r.store_id,
    }));

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

// GET /analytics/top-items
export const getTopItems = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.item_id',
          totalQty: { $sum: '$items.qty' },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          item_id: '$_id',
          totalQty: 1,
        },
      },
    ]);

    // attach food item names and calculate revenue properly
    const foodIds = result.map((r) => r.item_id);
    const foodItems = await FoodItem.find({ food_id: { $in: foodIds } }).lean();
    const foodMap = new Map(foodItems.map((f) => [f.food_id, f]));

    const enriched = result.map((r) => {
      const food = foodMap.get(r.item_id);
      return {
        ...r,
        name: food?.name || r.item_id,
        totalRevenue: (food?.price || 0) * r.totalQty,
      };
    });

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};
