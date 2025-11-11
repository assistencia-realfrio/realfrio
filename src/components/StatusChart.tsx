import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Wrench } from "lucide-react";

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface StatusChartProps {
  data: StatusData[];
  isLoading: boolean;
}

const StatusChart: React.FC<StatusChartProps> = ({ data, isLoading }) => {
  const hasData = data.length > 0 && data.some(d => d.value > 0);

  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            DISTRIBUIÇÃO DE STATUS DAS OS
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] sm:h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">CARREGANDO DADOS...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          DISTRIBUIÇÃO DE STATUS DAS OS
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] sm:h-[300px] p-0">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [String(value).toUpperCase(), String(name).toUpperCase()]} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" formatter={(value) => value.toUpperCase()} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            NENHUM DADO DE STATUS DISPONÍVEL.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusChart;