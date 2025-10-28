import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ServiceOrder } from "@/hooks/useServiceOrders";
import { getStatusBadgeVariant, statusBgColors } from "@/lib/serviceOrderStatus";

interface ServiceOrderCardProps {
    order: ServiceOrder;
}

const ServiceOrderCard: React.FC<ServiceOrderCardProps> = ({ order }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/orders/${order.id}`);
    };
    
    // Define a cor da barra lateral com base na loja
    const storeColorClass = order.store === 'CALDAS DA RAINHA' 
        ? 'bg-blue-500' 
        : 'bg-red-500';

    return (
        <Card 
            className={cn(
                "hover:shadow-lg transition-shadow cursor-pointer flex",
                "p-0",
                statusBgColors[order.status] || "bg-gray-500/20"
            )} 
            onClick={handleClick}
        >
            {/* Barra Lateral de Cor */}
            <div className={cn("w-2 rounded-l-lg", storeColorClass)} />

            {/* Conteúdo do Card */}
            <div className="flex flex-col flex-grow p-3"> {/* Reduzido p-4 para p-3 */}
                <CardHeader className="flex flex-row items-start justify-between space-y-0 p-0 pb-1"> {/* Reduzido pb-2 para pb-1 */}
                    <div className="text-sm font-medium text-muted-foreground truncate">{order.display_id}</div> {/* Reduzido text-base para text-sm */}
                    <Badge variant={getStatusBadgeVariant(order.status)} className="whitespace-nowrap text-xs px-2 py-0.5"> {/* Ajustado tamanho da badge */}
                        {order.status}
                    </Badge>
                </CardHeader>
                <CardContent className="p-0 pt-1 flex flex-col flex-grow"> {/* Reduzido pt-2 para pt-1 */}
                    {/* NOME DO CLIENTE AGORA É APENAS TEXTO */}
                    <p className="text-base font-semibold text-foreground mb-0.5 truncate">
                        Cliente: {order.client}
                    </p>
                    
                    <CardTitle className="text-base font-bold truncate mb-1"> {/* Reduzido text-lg para text-base, mb-2 para mb-1 */}
                        {order.equipment}
                    </CardTitle>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 flex-grow"> {/* Reduzido text-sm para text-xs, removido mb-3 h-10 */}
                        {order.description}
                    </p>
                </CardContent>
            </div>
        </Card>
    );
};

export default ServiceOrderCard;