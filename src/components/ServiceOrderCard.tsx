import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ServiceOrder } from "@/hooks/useServiceOrders";
import { statusCardClasses } from "@/lib/serviceOrderStatus";

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
                "p-0 border-0 rounded-lg", // Removendo bordas e padding padrão do card
                statusCardClasses[order.status] || "status-cancelada"
            )} 
            onClick={handleClick}
        >
            {/* Barra Lateral de Cor */}
            <div className={cn("w-2 rounded-l-md", storeColorClass)} />

            {/* Conteúdo do Card */}
            <div className="flex flex-col flex-grow p-3">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 p-0 pb-1">
                    <div className="text-sm font-medium text-current/80 truncate">{order.display_id}</div>
                    <Badge variant="outline" className="whitespace-nowrap text-xs px-2 py-0.5 border-current/50 bg-white/20 text-current">
                        {order.status}
                    </Badge>
                </CardHeader>
                <CardContent className="p-0 pt-1 flex flex-col flex-grow">
                    <p className="text-base font-semibold text-current mb-0.5 truncate">
                        Cliente: {order.client}
                    </p>
                    
                    <CardTitle className="text-base font-bold text-current truncate mb-1">
                        {order.equipment}
                    </CardTitle>
                    
                    <p className="text-xs text-current/80 line-clamp-2 flex-grow">
                        {order.description}
                    </p>
                </CardContent>
            </div>
        </Card>
    );
};

export default ServiceOrderCard;