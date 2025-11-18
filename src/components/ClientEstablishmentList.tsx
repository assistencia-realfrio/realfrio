"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClientEstablishmentListProps {
  clientId: string;
}

export const ClientEstablishmentList: React.FC<ClientEstablishmentListProps> = ({ clientId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Establishments</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">List of establishments for client ID: {clientId} will be shown here.</p>
      </CardContent>
    </Card>
  );
};