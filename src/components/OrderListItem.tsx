import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ServiceOrder } from "@/hooks/useServiceOrders";
import { getStatusBadgeVariant } from "@/lib/serviceOrderStatus";

interface OrderListItemProps {
  order: ServiceOrder;
}

const OrderListItem: React.FC<OrderListItemProps> = ({ order }) => {
    const navigate = useNavigate();
    
    const handleViewDetails = () => {
        navigate(`/orders/${order.id}`);
    };
    
    const date = new Date(order.created_at).toLocaleDateString('pt-BR');

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
                    <span>{date}</span>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
            </div>
        </div>
    );
};

export default OrderListItem;