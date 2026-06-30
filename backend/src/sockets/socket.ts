import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // clients can join store-specific rooms for targeted events
    socket.on('join_store', (storeId: string) => {
      socket.join(`store:${storeId}`);
      console.log(`[Socket] ${socket.id} joined store:${storeId}`);
    });

    socket.on('leave_store', (storeId: string) => {
      socket.leave(`store:${storeId}`);
      console.log(`[Socket] ${socket.id} left store:${storeId}`);
    });

    socket.on('disconnect', (reason: string) => {
      console.log(`[Socket] Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocket first.');
  }
  return io;
};

export const emitNewOrder = (order: any): void => {
  if (io) {
    io.emit('new_order', order);
    io.to(`store:${order.store_id}`).emit('store_new_order', order);
  }
};

export const emitOrderStatusUpdate = (order: any): void => {
  if (io) {
    io.emit('order_status_updated', order);
    io.to(`store:${order.store_id}`).emit('store_order_status_updated', order);
  }
};
