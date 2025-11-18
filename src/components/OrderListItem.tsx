import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ServiceOrder } from "@/hooks/useServiceOrders";
import { getStatusBadgeVariant } from "@/lib/serviceOrderStatus";
import { Calendar as CalendarIcon, User } from "lucide-react"; // Importado o ícone User
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
    
    const createdAtDate = new Date(order.created_at).toLocaleDateString('pt-BR');

    return (
        <Card 
            className="mb-2 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleViewDetails}
        >
            <CardContent className="flex justify-between items-start p-3">
                <div className="flex flex-col flex-grow min-w-0">
                    {/* NOVO: Nome do Cliente */}
                    <div className="flex items-center gap-1 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-base truncate">{order.client}</span>
                    </div>
                    <span className="font-medium text-sm truncate">{order.equipment} - {order.model}</span>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {order.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 font-semibold"> {/* Display ID em linha própria, com mais espaçamento */}
                        {order.display_id}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1"> {/* Datas em nova linha */}
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
                <div className="flex-shrink-0 ml-4">
                    <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderListItem;