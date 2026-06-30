import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import mongoose from 'mongoose';
import { initSocket } from './sockets/socket';
import orderRoutes from './routes/order.routes';
import storeRoutes from './routes/store.routes';
import analyticsRoutes from './routes/analytics.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

initSocket(httpServer);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/orders', orderRoutes);
app.use('/stores', storeRoutes);
app.use('/', analyticsRoutes);

app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tmbill';
    await mongoose.connect(mongoUri);
    console.log(`[DB] Connected to MongoDB`);

    httpServer.listen(PORT, () => {
      console.log(`[Server] http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[DB] Connection error:', error);
    process.exit(1);
  }
};

startServer();

export default app;
