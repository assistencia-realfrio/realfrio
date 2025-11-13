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
import { Check, MoreHorizontal, Calendar as CalendarIcon } from "lucide-react";
import { showLoading, dismissToast, showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ServiceOrderCardProps {
    order: ServiceOrder;
}

const getStoreSidebarColor = (store: ServiceOrder['store'] | null): string => {
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
                ...order,
                status: newStatus,
                model: order.model || undefined,
                serial_number: order.serial_number || undefined,
                equipment_id: order.equipment_id || undefined,
                scheduled_date: order.scheduled_date ? new Date(order.scheduled_date) : null,
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
    const storeSidebarColor = getStoreSidebarColor(order.store);

    return (
        <div 
            onClick={handleNavigate}
            className={cn(
                "hover:shadow-md transition-shadow flex relative rounded-lg border bg-card cursor-pointer"
            )} 
        >
            <div className="w-1.5 rounded-l-md" style={{ backgroundColor: storeSidebarColor }} />

            <div className="flex flex-col flex-grow p-3 sm:p-4"> {/* Reduzido padding para mobile */}
                <div className="flex items-start justify-between mb-2 sm:mb-3"> {/* Reduzido margin-bottom para mobile */}
                    <div className="font-semibold text-sm text-primary truncate pr-2">
                        {order.display_id}
                    </div>
                    <div className="flex items-center gap-2 -mt-1 -mr-1">
                        <Badge  
                            className="whitespace-nowrap text-xs border-transparent text-white"
                            style={{ backgroundColor: statusBgColor }}
                        >
                            {order.status}
                        </Badge>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-white">
                                <DropdownMenuLabel>Alterar Estado</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {serviceOrderStatuses.map((status) => (
                                    <DropdownMenuItem 
                                        key={status} 
                                        onClick={() => handleStatusChange(status)}
                                        disabled={updateOrder.isPending}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", order.status === status ? "opacity-100" : "opacity-0")} />
                                        {status}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                
                <div className="flex flex-col space-y-1 sm:space-y-2"> {/* Reduzido space-y para mobile */}
                    <div>
                        <p className="text-xs text-muted-foreground">Cliente</p>
                        <p className="font-semibold text-sm sm:text-base truncate">{order.client}</p> {/* Reduzido text-base para sm:text-base */}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Equipamento</p>
                        <p className="text-sm sm:text-base truncate">{order.equipment}</p> {/* Reduzido text-base para sm:text-base */}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Descrição</p>
                        <p className="text-xs sm:text-sm line-clamp-2">{order.description}</p> {/* Reduzido text-sm para sm:text-sm */}
                    </div>
                </div>

                {order.scheduled_date && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t"> {/* Reduzido mt e pt para mobile */}
                        <CalendarIcon className="h-4 w-4" />
                        <span>Agendado: {format(new Date(order.scheduled_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceOrderCard;