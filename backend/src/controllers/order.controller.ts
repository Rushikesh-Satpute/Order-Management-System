import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { Store } from '../models/Store';
import { FoodItem } from '../models/FoodItem';
import { StoreFoodItem } from '../models/StoreFoodItem';
import { ApiError } from '../middlewares/errorHandler';
import { emitNewOrder, emitOrderStatusUpdate } from '../sockets/socket';

// create a new order
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { store_id, items } = req.body;

    // check if store exists
    const store = await Store.findOne({ store_id }).lean();
    if (!store) {
      throw new ApiError(404, `Store '${store_id}' not found`);
    }

    // get what food items this store actually serves
    const storeMapping = await StoreFoodItem.findOne({ store_id }).lean();
    if (!storeMapping) {
      throw new ApiError(400, `No food items configured for store '${store_id}'`);
    }

    const availableFoodIds = new Set(storeMapping.food_items);

    // make sure every item in the order exists and is available at this store
    const foodIds = items.map((item: any) => item.item_id);
    const foodItems = await FoodItem.find({ food_id: { $in: foodIds } }).lean();
    const foodItemMap = new Map(foodItems.map((f) => [f.food_id, f]));

    for (const item of items) {
      const foodItem = foodItemMap.get(item.item_id);
      if (!foodItem) {
        throw new ApiError(404, `Food item '${item.item_id}' not found`);
      }
      if (!availableFoodIds.has(item.item_id)) {
        throw new ApiError(
          400,
          `Food item '${foodItem.name}' (${item.item_id}) is not available at store '${store.name}'`
        );
      }
    }

    // calculate total from item prices
    const total_amount = items.reduce((sum: number, item: any) => {
      const foodItem = foodItemMap.get(item.item_id);
      return sum + (foodItem?.price || 0) * item.qty;
    }, 0);

    const order = await Order.create({
      store_id,
      items,
      total_amount,
      status: 'PLACED',
    });

    // broadcast with store name so clients don't need to look it up
    emitNewOrder({
      ...order.toObject(),
      store_name: store.name,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// fetch orders with pagination, optionally filtered by store
export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { store_id, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (store_id) {
      filter.store_id = store_id;
    }

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);

    // pull store names and food item details in one go
    const storeIds = [...new Set(orders.map((o) => o.store_id))];
    const allFoodIds = [
      ...new Set(orders.flatMap((o) => o.items.map((i) => i.item_id))),
    ];

    const [stores, foodItems] = await Promise.all([
      Store.find({ store_id: { $in: storeIds } }).lean(),
      FoodItem.find({ food_id: { $in: allFoodIds } }).lean(),
    ]);

    const storeMap = new Map(stores.map((s) => [s.store_id, s]));
    const foodItemMap = new Map(foodItems.map((f) => [f.food_id, f]));

    const enrichedOrders = orders.map((order) => ({
      ...order,
      store_name: storeMap.get(order.store_id)?.name || order.store_id,
      items: order.items.map((item) => ({
        ...item,
        name: foodItemMap.get(item.item_id)?.name || item.item_id,
        price: foodItemMap.get(item.item_id)?.price || 0,
      })),
    }));

    res.status(200).json({
      success: true,
      data: enrichedOrders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// get single order by id
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).lean();

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // grab store name and food item details
    const [store, foodItems] = await Promise.all([
      Store.findOne({ store_id: order.store_id }).lean(),
      FoodItem.find({
        food_id: { $in: order.items.map((i) => i.item_id) },
      }).lean(),
    ]);

    const foodItemMap = new Map(foodItems.map((f) => [f.food_id, f]));

    const enrichedOrder = {
      ...order,
      store_name: store?.name || order.store_id,
      items: order.items.map((item) => ({
        ...item,
        name: foodItemMap.get(item.item_id)?.name || item.item_id,
        price: foodItemMap.get(item.item_id)?.price || 0,
      })),
    };

    res.status(200).json({
      success: true,
      data: enrichedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// update order status (PLACED -> PREPARING -> COMPLETED)
export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // grab store name for the socket broadcast
    const store = await Store.findOne({ store_id: order.store_id }).lean();

    emitOrderStatusUpdate({
      ...order,
      store_name: store?.name || order.store_id,
    });

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
