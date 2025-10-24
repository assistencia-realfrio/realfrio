import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ServiceOrder {
  id: string;
  title: string;
  client: string;
  status: "Pendente" | "Em Progresso" | "Concluída" | "Cancelada";
  priority: "Alta" | "Média" | "Baixa";
  store: "CALDAS DA RAINHA" | "PORTO DE MÓS"; // Novo campo
  date: string;
}

const getStatusVariant = (status: ServiceOrder['status']): "default" | "secondary" | "destructive" | "outline" => {
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

const getPriorityClasses = (priority: ServiceOrder['priority']) => {
  switch (priority) {
    case "Alta":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-100/80";
    case "Média":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-100/80";
    case "Baixa":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-100/80";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
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
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold truncate pr-2">{order.title}</CardTitle>
                <Badge variant={getStatusVariant(order.status)} className="whitespace-nowrap">{order.status}</Badge>
            </CardHeader>
            <CardContent>
                <div className="text-xl font-bold mb-2 text-primary">{order.id}</div>
                <p className="text-sm text-muted-foreground mb-1 truncate">Cliente: {order.client}</p>
                <p className="text-xs text-muted-foreground mb-3 truncate">Loja: {order.store}</p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <Badge className={cn("text-xs font-semibold", getPriorityClasses(order.priority))}>
                        Prioridade: {order.priority}
                    </Badge>
                    <span>{order.date}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default ServiceOrderCard;