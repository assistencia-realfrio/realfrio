import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ServiceOrder {
  id: string;
  title: string;
  client: string;
  status: "Pendente" | "Em Progresso" | "Concluída" | "Cancelada";
  priority: "Alta" | "Média" | "Baixa";
  date: string;
}

const getStatusVariant = (status: ServiceOrder['status']) => {
  switch (status) {
    case "Concluída":
      return "default";
    case "Em Progresso":
      return "secondary";
    case "Pendente":
      return "destructive";
    case "Cancelada":
      return "outline";
    default:
      return "outline";
  }
};

const getPriorityColor = (priority: ServiceOrder['priority']) => {
  switch (priority) {
    case "Alta":
      return "text-red-600";
    case "Média":
      return "text-yellow-600";
    case "Baixa":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

interface ServiceOrderCardProps {
    order: ServiceOrder;
}

const ServiceOrderCard: React.FC<ServiceOrderCardProps> = ({ order }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/orders/${order.id}`);
    };

    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium truncate">{order.title}</CardTitle>
                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold mb-2">{order.id}</div>
                <p className="text-xs text-muted-foreground mb-1">Cliente: {order.client}</p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Data: {order.date}</span>
                    <span className={`font-semibold ${getPriorityColor(order.priority)}`}>
                        Prioridade: {order.priority}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};

export default ServiceOrderCard;