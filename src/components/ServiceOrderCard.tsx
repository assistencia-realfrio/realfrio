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
                {/* ID da OS em destaque */}
                <div className="text-xl font-bold text-primary truncate">{order.display_id}</div>
                <Badge variant={getStatusVariant(order.status)} className="whitespace-nowrap">{order.status}</Badge>
            </CardHeader>
            <CardContent>
                {/* Cliente em destaque */}
                <p className="text-sm font-semibold text-foreground mb-1 truncate">Cliente: {order.client}</p>
                
                {/* Equipamento em destaque */}
                <CardTitle className="text-base font-medium truncate mb-2">
                    {order.equipment} - {order.model}
                </CardTitle>
                
                {/* Descrição (primeiras linhas) */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10">
                    {order.description}
                </p>
                
                <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                    <span>Loja: {order.store}</span>
                    <span>Criada em: {date}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default ServiceOrderCard;