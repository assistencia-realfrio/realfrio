import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ServiceOrder } from "@/hooks/useServiceOrders"; // Importando o tipo ServiceOrder do hook

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
    // const date = new Date(order.created_at).toLocaleDateString('pt-BR'); // Removido conforme solicitação

    // Define a cor da barra lateral com base na loja
    const storeColorClass = order.store === 'CALDAS DA RAINHA' 
        ? 'bg-blue-500' 
        : 'bg-red-500';

    return (
        <Card 
            className={cn(
                "hover:shadow-lg transition-shadow cursor-pointer flex",
                // Remove o padding padrão do Card para que a barra lateral funcione
                "p-0" 
            )} 
            onClick={handleClick}
        >
            {/* Barra Lateral de Cor */}
            <div className={cn("w-2 rounded-l-lg", storeColorClass)} />

            {/* Conteúdo do Card */}
            <div className="flex flex-col flex-grow p-4">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 p-0 pb-2">
                    {/* ID da OS com menos destaque (text-base) */}
                    <div className="text-base font-medium text-muted-foreground truncate">{order.display_id}</div>
                    <Badge variant={getStatusVariant(order.status)} className="whitespace-nowrap">{order.status}</Badge>
                </CardHeader>
                <CardContent className="p-0 pt-2 flex flex-col flex-grow">
                    {/* Cliente em destaque */}
                    <p className="text-lg font-semibold text-foreground mb-1 truncate">Cliente: {order.client}</p>
                    
                    {/* Equipamento em destaque */}
                    <CardTitle className="text-lg font-bold truncate mb-2">
                        {order.equipment}
                    </CardTitle>
                    
                    {/* Descrição */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10 flex-grow">
                        {order.description}
                    </p>
                    
                    {/* Removido: Informações de Loja e Data */}
                    {/* <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                        <span>Loja: {order.store}</span>
                        <span>Criada em: {date}</span>
                    </div> */}
                </CardContent>
            </div>
        </Card>
    );
};

export default ServiceOrderCard;