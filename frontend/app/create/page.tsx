'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCreateOrder } from '@/hooks/useOrders';
import { useStores, useStoreFoodItems, FoodItem } from '@/hooks/useStores';

export default function CreateOrderPage() {
  const router = useRouter();
  const createOrder = useCreateOrder();

  const [storeId, setStoreId] = useState('');
  const [selectedItems, setSelectedItems] = useState<
    { food_id: string; qty: number }[]
  >([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // fetch stores from API
  const { data: storesData, isLoading: storesLoading } = useStores();
  const stores = storesData?.data || [];

  // fetch food items when a store is selected
  const { data: storeFoodData, isLoading: foodItemsLoading } =
    useStoreFoodItems(storeId);
  const availableFoodItems = storeFoodData?.data?.foodItems || [];

  // auto-calculate total from selected items
  const totalAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      const foodItem = availableFoodItems.find(
        (f) => f.food_id === item.food_id
      );
      return sum + (foodItem?.price || 0) * item.qty;
    }, 0);
  }, [selectedItems, availableFoodItems]);

  // group menu items by category for the dropdown
  const foodByCategory = useMemo(() => {
    const grouped: Record<string, FoodItem[]> = {};
    availableFoodItems.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, [availableFoodItems]);

  const handleStoreChange = (newStoreId: string) => {
    setStoreId(newStoreId);
    setSelectedItems([]);
    setErrors({});
  };

  const addItem = () => {
    setSelectedItems([...selectedItems, { food_id: '', qty: 1 }]);
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: 'food_id' | 'qty',
    value: string | number
  ) => {
    const updated = [...selectedItems];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedItems(updated);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!storeId) {
      newErrors.store_id = 'Please select a store';
    }

    selectedItems.forEach((item, index) => {
      if (!item.food_id) {
        newErrors[`item_${index}_id`] = 'Please select a food item';
      }
      if (item.qty < 1) {
        newErrors[`item_${index}_qty`] = 'Quantity must be at least 1';
      }
    });

    if (selectedItems.length === 0) {
      newErrors.items = 'Add at least one item';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createOrder.mutateAsync({
        store_id: storeId,
        items: selectedItems.map((item) => ({
          item_id: item.food_id,
          qty: Number(item.qty),
        })),
      });

      router.push('/orders');
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to create order';
      setErrors({ submit: message });
    }
  };

  const getFoodItemById = (id: string) =>
    availableFoodItems.find((f) => f.food_id === id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Order
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-400">
            Select a store and add items to create a new order.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* store picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                Select Store
              </label>
              <select
                value={storeId}
                onChange={(e) => handleStoreChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus:border-blue-400"
              >
                <option value="">
                  {storesLoading ? 'Loading stores...' : 'Choose a store'}
                </option>
                {stores.map((store) => (
                  <option key={store.store_id} value={store.store_id}>
                    {store.name} ({store.type})
                  </option>
                ))}
              </select>
              {errors.store_id && (
                <p className="text-sm text-red-500">{errors.store_id}</p>
              )}
            </div>

            {/* food items */}
            {storeId && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Order Items
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addItem}
                    disabled={availableFoodItems.length === 0}
                  >
                    + Add Item
                  </Button>
                </div>

                {foodItemsLoading && (
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    Loading menu items...
                  </p>
                )}

                {!foodItemsLoading && availableFoodItems.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    No food items available for this store.
                  </p>
                )}

                {selectedItems.map((item, index) => {
                  const selectedFood = getFoodItemById(item.food_id);
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-zinc-700"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <select
                          value={item.food_id}
                          onChange={(e) =>
                            updateItem(index, 'food_id', e.target.value)
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                        >
                          <option value="">Select item</option>
                          {Object.entries(foodByCategory).map(
                            ([category, items]) => (
                              <optgroup key={category} label={category}>
                                {items.map((food) => (
                                  <option
                                    key={food.food_id}
                                    value={food.food_id}
                                  >
                                    {food.name} - ₹{food.price}
                                  </option>
                                ))}
                              </optgroup>
                            )
                          )}
                        </select>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              item.qty > 1 &&
                              updateItem(index, 'qty', item.qty - 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(index, 'qty', item.qty + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {selectedFood && (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            ₹{selectedFood.price * item.qty}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-zinc-400">
                            ₹{selectedFood.price} × {item.qty}
                          </span>
                        </div>
                      )}

                      {selectedItems.length > 1 && (
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="mt-1"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  );
                })}

                {errors.items && (
                  <p className="text-sm text-red-500">{errors.items}</p>
                )}
              </div>
            )}

            {/* running total */}
            {selectedItems.length > 0 && (
              <div className="rounded-lg bg-gray-100 p-4 dark:bg-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-700 dark:text-zinc-300">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>
            )}

            {/* submit error */}
            {errors.submit && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {errors.submit}
              </div>
            )}

            {/* action buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                isLoading={createOrder.isPending}
                className="flex-1"
                disabled={!storeId || selectedItems.length === 0}
              >
                Create Order
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/orders')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
