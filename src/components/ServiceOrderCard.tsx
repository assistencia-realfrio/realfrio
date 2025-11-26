import React from "react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ServiceOrder, useServiceOrders, serviceOrderStatuses, ServiceOrderStatus } from "@/hooks/useServiceOrders";
import { statusChartColors } from "@/lib/serviceOrderStatus";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, MoreHorizontal, Calendar as CalendarIcon, User, HardDrive, FileText, MessageSquareText, Paperclip, Building, Clock } from "lucide-react";
import { showLoading, dismissToast, showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { hexToRgba } from "@/lib/utils";

interface ServiceOrderCardProps {
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

const ServiceOrderCard: React.FC<ServiceOrderCardProps> = ({ order }) => {
    const navigate = useNavigate();
    const { updateOrder } = useServiceOrders();

    const handleNavigate = () => {
        navigate(`/orders/${order.id}`);
    };

    const handleStatusChange = async (newStatus: ServiceOrderStatus) => {
        const toastId = showLoading(`Alterando estado para ${newStatus}...`);
        try {
            await updateOrder.mutateAsync({
                id: order.id,
                client_id: order.client_id,
                description: order.description,
                status: newStatus,
                store: order.store,
                equipment: order.equipment,
                model: order.model || null,
                serial_number: order.serial_number || null,
                equipment_id: order.equipment_id || null,
                establishment_id: order.establishment_id || null,
                establishment_name: order.establishment_name || null,
                scheduled_date: order.scheduled_date,
            });
            dismissToast(toastId);
            showSuccess("Estado da OS alterado com sucesso!");
        } catch (error) {
            dismissToast(toastId);
            showError("Erro ao alterar o estado da OS.");
            console.error("Status update error:", error);
        }
    };
    
    const statusBgColor = statusChartColors[order.status];
    const storeColor = getStoreColor(order.store);
    const cardBackgroundColor = hexToRgba(statusBgColor, 0.05);
    
    const scheduledDate = order.scheduled_date ? new Date(order.scheduled_date) : null;
    
    const isTimeExplicitlySet = scheduledDate && (scheduledDate.getHours() !== 0 || scheduledDate.getMinutes() !== 0);


    return (
        <div 
            onClick={handleNavigate}
            className={cn(
                "hover:shadow-md transition-shadow flex relative rounded-lg border cursor-pointer overflow-hidden"
            )} 
            style={{ backgroundColor: cardBackgroundColor }}
        >
            <div 
                className="w-4 flex-shrink-0 rounded-l-lg" 
                style={{ backgroundColor: storeColor }}
            ></div>

            <div className="flex flex-col flex-grow">
                <div className="flex items-center justify-between px-3 py-1.5">
                    <div className="font-semibold text-sm text-foreground truncate pr-2 uppercase">
                        {order.display_id}
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge  
                            className="whitespace-nowrap text-xs px-2 py-0.5 border-transparent text-black h-6 flex items-center uppercase"
                            style={{ backgroundColor: hexToRgba(statusBgColor, 0.6) }}
                        >
                            {order.status}
                        </Badge>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    className="p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent hover:bg-muted text-muted-foreground"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuLabel className="uppercase">Alterar Estado</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {serviceOrderStatuses.map((status) => (
                                    <DropdownMenuItem 
                                        key={status} 
                                        onClick={() => handleStatusChange(status)}
                                        disabled={updateOrder.isPending}
                                        className="uppercase"
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", order.status === status ? "opacity-100" : "opacity-0")} />
                                        {status}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="flex flex-col flex-grow p-4 pt-2">
                    <div className="flex flex-col space-y-2 flex-grow">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <p className="font-semibold text-base truncate uppercase">{order.client}</p>
                        </div>
                        {order.establishment_name && (
                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <p className="text-sm font-medium truncate uppercase">{order.establishment_name}</p>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-base truncate uppercase">{order.equipment}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-muted-foreground line-clamp-2 uppercase">{order.description}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 flex-wrap">
                            {scheduledDate && (
                                <>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span className="uppercase">{format(scheduledDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
                                    </div>
                                    {isTimeExplicitlySet && (
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Clock className="h-4 w-4 ml-2" />
                                            <span className="uppercase">{format(scheduledDate, 'HH:mm', { locale: ptBR })}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {order.notes_count > 0 && (
                                <div className="flex items-center text-xs gap-1 text-muted-foreground hover:text-foreground transition-colors">
                                    <MessageSquareText className="h-4 w-4" />
                                    <span className="uppercase">{order.notes_count}</span>
                                </div>
                            )}
                            {order.attachments_count > 0 && (
                                <div className="flex items-center text-xs gap-1 text-muted-foreground hover:text-foreground transition-colors">
                                    <Paperclip className="h-4 w-4" />
                                    <span className="uppercase">{order.attachments_count}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceOrderCard;