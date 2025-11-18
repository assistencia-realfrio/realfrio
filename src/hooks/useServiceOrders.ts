"use client";

import { useQuery } from '@tanstack/react-query';

interface ServiceOrder {
  id: string;
  description: string;
  status: string;
}

const fetchServiceOrders = async (): Promise<ServiceOrder[]> => {
  // Placeholder implementation
  return [];
};

export const useServiceOrders = () => {
  return useQuery<ServiceOrder[], Error>({
    queryKey: ['serviceOrders'],
    queryFn: fetchServiceOrders,
  });
};