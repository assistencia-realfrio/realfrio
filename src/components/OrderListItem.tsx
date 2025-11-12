import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ServiceOrder } from "@/hooks/useServiceOrders";
import { getStatusBadgeVariant } from "@/lib/serviceOrderStatus";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card"; // Importar Card e CardContent

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
            className="mb-2 cursor-pointer hover:bg-muted/50 transition-colors" // Adicionado mb-2 para espaçamento entre os cartões
            onClick={handleViewDetails}
        >
            <CardContent className="flex justify-between items-start p-3"> {/* Ajustado padding */}
                <div className="flex flex-col flex-grow min-w-0">
                    <span className="font-medium text-sm truncate">{order.equipment} - {order.model}</span>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-2"> {/* Adicionada a descrição */}
                        {order.description}
                    </p>
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
                <div className="flex-shrink-0 ml-4"> {/* Adicionado ml-4 para espaçamento */}
                    <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderListItem;