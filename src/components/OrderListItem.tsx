import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ServiceOrder } from "@/hooks/useServiceOrders";
import { getStatusBadgeVariant } from "@/lib/serviceOrderStatus";
import { Calendar as CalendarIcon, User, Clock } from "lucide-react"; // Adicionado Clock
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";

interface OrderListItemProps {
  order: ServiceOrder;
}

const OrderListItem: React.FC<OrderListItemProps> = ({ order }) => {
    const navigate = useNavigate();
    
    const handleViewDetails = () => {
        navigate(`/orders/${order.id}`);
    };
    
    const scheduledDate = order.scheduled_date ? new Date(order.scheduled_date) : null;

    return (
        <Card 
            className="mb-2 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleViewDetails}
        >
            <CardContent className="flex flex-col p-3">
                <Badge variant={getStatusBadgeVariant(order.status)} className="mb-2 self-start">{order.status}</Badge>
                
                <div className="flex flex-col flex-grow min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-semibold text-base truncate">{order.client}</span>
                    </div>
                    <span className="font-medium text-sm truncate">{order.equipment} - {order.model}</span>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {order.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 font-semibold">
                        {order.display_id}
                    </p>
                    
                    {/* NOVO: Exibir data e hora do agendamento */}
                    {scheduledDate && (
                        <div className="flex items-center gap-1 text-xs text-primary mt-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span className="font-medium">
                                {format(scheduledDate, 'dd/MM/yyyy')}
                            </span>
                            <Clock className="h-4 w-4 ml-2" />
                            <span className="font-medium">
                                {format(scheduledDate, 'HH:mm')}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderListItem;