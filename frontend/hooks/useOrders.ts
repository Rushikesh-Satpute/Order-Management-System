'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

type OrderStatus = 'PLACED' | 'PREPARING' | 'COMPLETED';

export interface OrderItem {
  item_id: string;
  qty: number;
  name?: string;
  price?: number;
}

export interface Order {
  _id: string;
  store_id: string;
  store_name?: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  created_at: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: PaginationInfo;
}

export interface CreateOrderInput {
  store_id: string;
  items: OrderItem[];
}

// fetch orders list with pagination
export const useOrders = (
  storeId?: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery<OrdersResponse>({
    queryKey: ['orders', storeId, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (storeId) params.append('store_id', storeId);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const { data } = await api.get(`/orders?${params.toString()}`);
      return data;
    },
    refetchOnWindowFocus: false,
  });
};

// fetch single order
export const useOrder = (id: string) => {
  return useQuery<{ success: boolean; data: Order }>({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// create new order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderInput) => {
      const { data } = await api.post('/orders', orderData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: OrderStatus;
    }) => {
      const { data } = await api.patch(`/orders/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
};
