'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Store {
  store_id: string;
  name: string;
  type: string;
}

export interface FoodItem {
  food_id: string;
  name: string;
  category: string;
  price: number;
}

export interface StoreFoodItemsResponse {
  success: boolean;
  data: {
    store: Store;
    foodItems: FoodItem[];
  };
}

// fetch all stores
export const useStores = () => {
  return useQuery<{ success: boolean; data: Store[] }>({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data } = await api.get('/stores');
      return data;
    },
    staleTime: 5 * 60 * 1000, // cache for 5 min, stores don't change often
  });
};

// fetch food items for a specific store
export const useStoreFoodItems = (storeId: string) => {
  return useQuery<StoreFoodItemsResponse>({
    queryKey: ['storeFoodItems', storeId],
    queryFn: async () => {
      const { data } = await api.get(`/stores/${storeId}/food-items`);
      return data;
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
};
