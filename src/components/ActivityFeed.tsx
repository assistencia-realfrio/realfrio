"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityFeedProps {
  entityType: 'client' | 'service_order' | 'equipment';
  entityId: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ entityType, entityId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Activity logging for {entityType} (ID: {entityId}) will be displayed here.</p>
      </CardContent>
    </Card>
  );
};