import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  iconColorClass?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, icon: Icon, iconColorClass = "text-primary" }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium uppercase">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", iconColorClass)} />
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-bold uppercase">{value}</div>
        <p className="text-xs text-muted-foreground uppercase">{description}</p>
      </CardContent>
    </Card>
  );
};

export default MetricCard;