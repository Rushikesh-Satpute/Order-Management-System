'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface OrdersPerDay {
  date: string;
  count: number;
}

export interface RevenuePerStore {
  store_id: string;
  store_name?: string;
  totalRevenue: number;
  orderCount: number;
}

export interface TopItem {
  item_id: string;
  name?: string;
  totalQty: number;
  totalRevenue: number;
}

export const useOrdersPerDay = () => {
  return useQuery<OrdersPerDay[]>({
    queryKey: ['analytics', 'orders-per-day'],
    queryFn: async () => {
      const { data } = await api.get('/orders-per-day');
      return data.data;
    },
  });
};

export const useRevenuePerStore = () => {
  return useQuery<RevenuePerStore[]>({
    queryKey: ['analytics', 'revenue-per-store'],
    queryFn: async () => {
      const { data } = await api.get('/revenue-per-store');
      return data.data;
    },
  });
};

export const useTopItems = () => {
  return useQuery<TopItem[]>({
    queryKey: ['analytics', 'top-items'],
    queryFn: async () => {
      const { data } = await api.get('/top-items');
      return data.data;
    },
  });
};

export const useArchiveOldOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/archive-old-orders');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};
