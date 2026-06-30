'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/orders/StatusBadge';
import { StatusSelect } from '@/components/orders/StatusSelect';
import { useOrder } from '@/hooks/useOrders';
import { getSocket } from '@/lib/socket';
import { useQueryClient } from '@tanstack/react-query';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useOrder(orderId);

  // live updates for this order
  useEffect(() => {
    const socket = getSocket();

    socket.on('order_status_updated', (updatedOrder: any) => {
      if (updatedOrder._id === orderId) {
        queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      }
    });

    return () => {
      socket.off('order_status_updated');
    };
  }, [orderId, queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
        <div className="mx-auto max-w-2xl px-4">
          <Card>
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
        <div className="mx-auto max-w-2xl px-4">
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">
                Order not found or failed to load.
              </p>
              <Link href="/orders">
                <Button variant="secondary">Back to Orders</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const order = data.data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/orders">
                <Button variant="ghost" size="sm">
                  ← Back
                </Button>
              </Link>
             </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order Details
            </h1>
            <p className="mt-1 font-mono text-sm text-gray-500 dark:text-zinc-400">
              {order._id}
            </p>
          </div>
        </div>

        {/* order info */}
        <Card title="Order Information" className="mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Store
              </p>
              <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                {order.store_name || order.store_id}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Total Amount
              </p>
              <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                ₹{order.total_amount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Current Status
              </p>
              <div className="mt-1">
                <StatusBadge status={order.status} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Created At
              </p>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        {/* status update */}
        <Card title="Update Status"  className="mb-6" subtitle="Change the order status below">
          <div className="flex items-center gap-4">
            <StatusSelect orderId={order._id} currentStatus={order.status} />
          </div>
        </Card>

        {/* items list */}
        <Card title="Order Items">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-700">
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                    Item
                  </th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                    Price
                  </th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                    Quantity
                  </th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 text-sm text-gray-900 dark:text-zinc-100">
                      {item.name || item.item_id}
                    </td>
                    <td className="py-3 text-sm text-gray-700 dark:text-zinc-300">
                      ₹{(item.price || 0).toFixed(2)}
                    </td>
                    <td className="py-3 text-sm text-gray-700 dark:text-zinc-300">
                      {item.qty}
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-900 dark:text-zinc-100">
                      ₹{((item.price || 0) * item.qty).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
