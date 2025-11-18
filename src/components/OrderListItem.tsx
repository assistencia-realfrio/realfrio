import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ServiceOrder } from "@/hooks/useServiceOrders";
import { getStatusBadgeVariant } from "@/lib/serviceOrderStatus";
import { Calendar as CalendarIcon, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { hexToRgba } from "@/lib/utils";
import { statusChartColors } from "@/lib/serviceOrderStatus";

interface OrderListItemProps {
  order: ServiceOrder;
}

const getStoreColor = (store: ServiceOrder['store'] | null): string => {
  switch (store) {
    case "CALDAS DA RAINHA":
      return "#3b82f6"; // blue-500
    case "PORTO DE MÓS":
      return "#ef4444"; // red-500
    default:
      return "#9ca3af"; // gray-400
  }
};

const OrderListItem: React.FC<OrderListItemProps> = ({ order }) => {
    const navigate = useNavigate();
    
    const handleViewDetails = () => {
        navigate(`/orders/${order.id}`);
    };
    
    const scheduledDate = order.scheduled_date ? new Date(order.scheduled_date) : null;
    
    const storeColor = getStoreColor(order.store);
    const statusBgColor = statusChartColors[order.status];
    const cardBackgroundColor = hexToRgba(statusBgColor, 0.05);

    return (
        <div 
            className={cn(
                "mb-2 cursor-pointer hover:shadow-md transition-shadow flex relative rounded-lg border overflow-hidden"
            )}
            onClick={handleViewDetails}
            style={{ backgroundColor: cardBackgroundColor }}
        >
            {/* Barra lateral colorida da loja */}
            <div 
                className="w-2 flex-shrink-0 rounded-l-lg" 
                style={{ backgroundColor: storeColor }}
            ></div>
            
            <Card className="flex-1 border-none shadow-none m-0 p-0 bg-transparent">
                <CardContent className="flex flex-col p-3">
                    
                    {/* NOVO: Container para o cabeçalho e badge */}
                    <div className="flex justify-between items-start w-full mb-2">
                        <span className="font-medium text-sm truncate">{order.equipment} - {order.model}</span>
                        <Badge 
                            className="self-start text-sm px-2 py-0.5 border-transparent text-white h-6 flex items-center flex-shrink-0"
                            style={{ backgroundColor: hexToRgba(statusBgColor, 0.6) }}
                        >
                            {order.status}
                        </Badge>
                    </div>
                    
                    <div className="flex flex-col flex-grow min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-semibold text-base truncate">{order.client}</span>
                        </div>
                        
                        {/* Removido o equipamento daqui, pois já está no cabeçalho */}
                        
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {order.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 font-semibold">
                            {order.display_id}
                        </p>
                        
                        {/* Exibir data e hora do agendamento */}
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
        </div>
    );
};

export default OrderListItem;