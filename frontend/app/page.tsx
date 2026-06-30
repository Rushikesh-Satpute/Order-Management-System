'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  useOrdersPerDay,
  useRevenuePerStore,
  useTopItems,
  useArchiveOldOrders,
} from '@/hooks/useAnalytics';
import { useStores } from '@/hooks/useStores';
import { getSocket } from '@/lib/socket';
import { useQueryClient } from '@tanstack/react-query';

export default function DashboardPage() {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  const { data: ordersPerDay, isLoading: loadingOrdersPerDay } =
    useOrdersPerDay();
  const { data: revenuePerStore, isLoading: loadingRevenue } =
    useRevenuePerStore();
  const { data: topItems, isLoading: loadingTopItems } = useTopItems();
  const archiveMutation = useArchiveOldOrders();
  const { data: storesData } = useStores();
  const stores = storesData?.data || [];

  // refresh analytics on new orders
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    socket.on('new_order', () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    });

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new_order');
    };
  }, [queryClient]);

  const handleArchive = async () => {
    if (
      window.confirm(
        'Are you sure you want to archive orders older than 30 days? This action cannot be undone.'
      )
    ) {
      try {
        const result = await archiveMutation.mutateAsync();
        alert(
          `Successfully archived ${result.data.archived} orders.`
        );
      } catch {
        alert('Failed to archive orders. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-zinc-400">
              Analytics and insights for your order management system.
            </p>
          </div>
          <div className="flex items-center gap-4">
           <Link href="/orders">
              <Button variant="secondary">View Orders</Button>
            </Link>
            <Link href="/create">
              <Button>+ New Order</Button>
            </Link>
          </div>
        </div>

        {/* archive old orders */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Data Management
              </h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Archive orders older than 30 days to keep your database clean.
              </p>
            </div>
            <Button
              variant="danger"
              onClick={handleArchive}
              isLoading={archiveMutation.isPending}
            >
              Archive Old Orders
            </Button>
          </div>
          {archiveMutation.isSuccess && (
            <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
              Archive completed successfully!
            </div>
          )}
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* orders per day chart */}
          <Card title="Orders Per Day" subtitle="Last 30 days">
            {loadingOrdersPerDay ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : ordersPerDay && ordersPerDay.length > 0 ? (
              <div className="space-y-3">
                {ordersPerDay.map((item) => (
                  <div
                    key={item.date}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700 dark:text-zinc-300">
                      {item.date}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-700">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{
                            width: `${Math.min(
                              (item.count /
                                Math.max(
                                  ...ordersPerDay.map((d) => d.count)
                                )) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-sm font-medium text-gray-900 dark:text-white">
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-zinc-400">
                No data available yet. Create some orders to see analytics.
              </p>
            )}
          </Card>

          {/* revenue by store */}
          <Card title="Revenue Per Store" subtitle="Total revenue by store">
            {loadingRevenue ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : revenuePerStore && revenuePerStore.length > 0 ? (
              <div className="space-y-4">
                {revenuePerStore.map((store) => (
                  <div
                    key={store.store_id}
                    className="rounded-lg border border-gray-200 p-4 dark:border-zinc-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stores.find((s) => s.store_id === store.store_id)?.name || store.store_id}
                      </span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        ₹{store.totalRevenue.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      {store.orderCount} order{store.orderCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-zinc-400">
                No revenue data available yet.
              </p>
            )}
          </Card>

          {/* top selling items */}
          <Card
            title="Top 5 Selling Items"
            subtitle="Most popular items by quantity"
            className="lg:col-span-2"
          >
            {loadingTopItems ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : topItems && topItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-zinc-700">
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        Rank
                      </th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        Item ID
                      </th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        Total Qty Sold
                      </th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        Est. Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                    {topItems.map((item, index) => (
                      <tr key={item.item_id}>
                        <td className="py-3">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              index === 0
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : index === 1
                                ? 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-300'
                                : index === 2
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                : 'bg-gray-50 text-gray-600 dark:bg-zinc-800/50 dark:text-zinc-400'
                            }`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 text-sm font-mono text-gray-900 dark:text-zinc-100">
                          {item.name || item.item_id}
                        </td>
                        <td className="py-3 text-sm text-gray-700 dark:text-zinc-300">
                          {item.totalQty}
                        </td>
                        <td className="py-3 text-sm font-medium text-gray-900 dark:text-white">
                          ₹{item.totalRevenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-zinc-400">
                No item data available yet.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
