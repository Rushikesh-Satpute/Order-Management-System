'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/orders/StatusBadge';
import { useOrders } from '@/hooks/useOrders';
import { useStores } from '@/hooks/useStores';
import { getSocket } from '@/lib/socket';
import { useQueryClient } from '@tanstack/react-query';

export default function OrdersListPage() {
  const [storeId, setStoreId] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useOrders(storeId || undefined, page, 10);
  const { data: storesData } = useStores();
  const stores = storesData?.data || [];

  // live updates via socket
  useEffect(() => {
    const socket = getSocket();

    socket.on('new_order', () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    socket.on('order_status_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    return () => {
      socket.off('new_order');
      socket.off('order_status_updated');
    };
  }, [queryClient]);

  const handleFilter = () => {
    setPage(1);
  };

  const handleClearFilter = () => {
    setStoreId('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Orders
            </h1>
            <p className="mt-2 text-gray-600 dark:text-zinc-400">
              View and manage all orders across stores.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/create">
              <Button>+ New Order</Button>
            </Link>
          </div>
        </div>

        {/* store filter */}
        <Card className="mb-6">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                Filter by Store
              </label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              >
                <option value="">All Stores</option>
                {stores.map((store) => (
                  <option key={store.store_id} value={store.store_id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleFilter} size="md">
              Filter
            </Button>
            {storeId && (
              <Button variant="ghost" onClick={handleClearFilter} size="md">
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* error state */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">
              Failed to load orders. Please check if the backend is running.
            </p>
          </Card>
        )}

        {/* loading spinner */}
        {isLoading && (
          <Card>
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          </Card>
        )}

        {/* orders table */}
        {data && !isLoading && (
          <Card>
            {data.data.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500 dark:text-zinc-400">
                  No orders found.
                </p>
                <Link href="/create" className="mt-4 inline-block">
                  <Button variant="secondary">Create your first order</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-zinc-700">
                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                          Order ID
                        </th>
                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                          Store
                        </th>
                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                          Items
                        </th>
                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                          Total
                        </th>
                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                          Status
                        </th>
                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                          Date
                        </th>
                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                      {data.data.map((order) => (
                        <tr
                          key={order._id}
                          className="transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                        >
                          <td className="py-4 text-sm font-mono text-gray-900 dark:text-zinc-100">
                            {order._id.slice(-8)}...
                          </td>
                          <td className="py-4 text-sm text-gray-700 dark:text-zinc-300">
                            {order.store_name || order.store_id}
                          </td>
                          <td className="py-4 text-sm text-gray-700 dark:text-zinc-300">
                            <div className="max-w-50 truncate">
                              {order.items
                                .map((item) => `${item.name || item.item_id} ×${item.qty}`)
                                .join(', ')}
                            </div>
                          </td>
                          <td className="py-4 text-sm font-medium text-gray-900 dark:text-zinc-100">
                            ₹{order.total_amount.toFixed(2)}
                          </td>
                          <td className="py-4">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="py-4 text-sm text-gray-500 dark:text-zinc-400">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <Link href={`/orders/${order._id}`}>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* pagination */}
                {data.pagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-zinc-700">
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                      Showing {(page - 1) * 10 + 1} to{' '}
                      {Math.min(page * 10, data.pagination.total)} of{' '}
                      {data.pagination.total} orders
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-3 text-sm text-gray-700 dark:text-zinc-300">
                        Page {page} of {data.pagination.totalPages}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setPage((p) =>
                            Math.min(data.pagination.totalPages, p + 1)
                          )
                        }
                        disabled={page === data.pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
