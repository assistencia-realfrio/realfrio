import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ServiceOrder } from "@/hooks/useServiceOrders";
import { getStatusBadgeVariant } from "@/lib/serviceOrderStatus";
import { Calendar as CalendarIcon } from "lucide-react"; // Importar CalendarIcon
import { format } from "date-fns"; // Importar format
import { ptBR } from "date-fns/locale"; // Importar locale ptBR

interface OrderListItemProps {
  order: ServiceOrder;
}

const OrderListItem: React.FC<OrderListItemProps> = ({ order }) => {
    const navigate = useNavigate();
    
    const handleViewDetails = () => {
        navigate(`/orders/${order.id}`);
    };
    
    const createdAtDate = new Date(order.created_at).toLocaleDateString('pt-BR');

    return (
        <div 
            className="flex justify-between items-center py-2 hover:bg-muted/50 px-2 rounded-md transition-colors cursor-pointer"
            onClick={handleViewDetails}
        >
            <div className="flex flex-col">
                <span className="font-medium text-sm">{order.equipment} - {order.model}</span>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{order.display_id}</span>
                    <span>|</span>
                    <span>{createdAtDate}</span>
                    {order.scheduled_date && (
                        <>
                            <span>|</span>
                            <CalendarIcon className="h-3 w-3" />
                            <span>{format(new Date(order.scheduled_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
            </div>
        </div>
    );
};

export default OrderListItem;