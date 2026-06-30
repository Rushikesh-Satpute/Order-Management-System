'use client';

import React from 'react';
import { Select } from '@/components/ui/Input';
import { useUpdateOrderStatus } from '@/hooks/useOrders';

interface StatusSelectProps {
  orderId: string;
  currentStatus: 'PLACED' | 'PREPARING' | 'COMPLETED';
}

const statusOptions = [
  { value: 'PLACED', label: 'Placed' },
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'COMPLETED', label: 'Completed' },
];

export function StatusSelect({ orderId, currentStatus }: StatusSelectProps) {
  const updateStatus = useUpdateOrderStatus();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'PLACED' | 'PREPARING' | 'COMPLETED';
    if (newStatus !== currentStatus) {
      updateStatus.mutate({ id: orderId, status: newStatus });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        options={statusOptions}
        value={currentStatus}
        onChange={handleChange}
        disabled={updateStatus.isPending}
        className="w-40"
      />
      {updateStatus.isPending && (
        <span className="text-xs text-gray-500">Updating...</span>
      )}
    </div>
  );
}
