"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EquipmentListProps {
  clientId: string;
}

export const EquipmentList: React.FC<EquipmentListProps> = ({ clientId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment List</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">List of equipment associated with client ID: {clientId} will be shown here.</p>
      </CardContent>
    </Card>
  );
};