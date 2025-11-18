"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimeEntryListProps {
  serviceOrderId?: string;
  clientId?: string;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({ serviceOrderId, clientId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Time tracking functionality will be implemented here.</p>
        {serviceOrderId && <p>Filtering by Service Order ID: {serviceOrderId}</p>}
        {clientId && <p>Filtering by Client ID: {clientId}</p>}
      </CardContent>
    </Card>
  );
};