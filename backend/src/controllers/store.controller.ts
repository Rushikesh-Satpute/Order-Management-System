import { Request, Response, NextFunction } from 'express';
import { Store } from '../models/Store';
import { FoodItem } from '../models/FoodItem';
import { StoreFoodItem } from '../models/StoreFoodItem';

// get all stores
export const getStores = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stores = await Store.find().lean();
    res.status(200).json({
      success: true,
      data: stores,
    });
  } catch (error) {
    next(error);
  }
};

// get food items available at a specific store
export const getStoreFoodItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { storeId } = req.params;

    const store = await Store.findOne({ store_id: storeId }).lean();
    if (!store) {
      res.status(404).json({
        success: false,
        message: 'Store not found',
      });
      return;
    }

    // find what food items this store has
    const mapping = await StoreFoodItem.findOne({ store_id: storeId }).lean();
    if (!mapping) {
      res.status(200).json({
        success: true,
        data: {
          store,
          foodItems: [],
        },
      });
      return;
    }

    // pull full details for those food items
    const foodItems = await FoodItem.find({
      food_id: { $in: mapping.food_items },
    }).lean();

    res.status(200).json({
      success: true,
      data: {
        store,
        foodItems,
      },
    });
  } catch (error) {
    next(error);
  }
};
