import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { OrderArchive } from '../models/OrderArchive';

// move orders older than 30 days to the archive collection
export const archiveOldOrders = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldOrders = await Order.find({
      created_at: { $lt: thirtyDaysAgo },
    }).lean();

    if (oldOrders.length === 0) {
      res.status(200).json({
        success: true,
        message: 'No orders older than 30 days found',
        data: { archived: 0 },
      });
      return;
    }

    const archiveDocuments = oldOrders.map((order) => ({
      store_id: order.store_id,
      items: order.items,
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at,
      archived_at: new Date(),
    }));

    // copy to archive, then delete from orders
    const [insertResult, deleteResult] = await Promise.all([
      OrderArchive.insertMany(archiveDocuments),
      Order.deleteMany({ created_at: { $lt: thirtyDaysAgo } }),
    ]);

    res.status(200).json({
      success: true,
      message: `Successfully archived ${insertResult.length} orders`,
      data: {
        archived: insertResult.length,
        deleted: deleteResult.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
