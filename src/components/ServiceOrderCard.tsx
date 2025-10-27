import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ServiceOrder } from "@/hooks/useServiceOrders"; // Importando o tipo ServiceOrder do hook

// O tipo ServiceOrder agora é importado do hook, mas mantemos a lógica de visualização.

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

// Removendo getPriorityClasses, pois a prioridade foi removida.

interface ServiceOrderCardProps {
    order: ServiceOrder;
}

const ServiceOrderCard: React.FC<ServiceOrderCardProps> = ({ order }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/orders/${order.id}`);
    };
    
    // Formata a data para exibição
    const date = new Date(order.created_at).toLocaleDateString('pt-BR');

    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold truncate pr-2">{order.title}</CardTitle>
                <Badge variant={getStatusVariant(order.status)} className="whitespace-nowrap">{order.status}</Badge>
            </CardHeader>
            <CardContent>
                <div className="text-xl font-bold mb-2 text-primary truncate">{order.id.substring(0, 8)}...</div>
                <p className="text-sm text-muted-foreground mb-1 truncate">Cliente: {order.client}</p>
                <p className="text-xs text-muted-foreground mb-3 truncate">Loja: {order.store}</p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                    {/* Prioridade removida */}
                    <span>{date}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default ServiceOrderCard;