"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceOrderListProps {
  clientId?: string;
  equipmentId?: string;
}

export const ServiceOrderList: React.FC<ServiceOrderListProps> = ({ clientId, equipmentId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">List of service orders will be displayed here.</p>
        {clientId && <p>Filtering by Client ID: {clientId}</p>}
        {equipmentId && <p>Filtering by Equipment ID: {equipmentId}</p>}
      </CardContent>
    </Card>
  );
};