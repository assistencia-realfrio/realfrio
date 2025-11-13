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
import { Check, MoreHorizontal, Calendar as CalendarIcon, User, HardDrive, FileText } from "lucide-react";
import { showLoading, dismissToast, showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { hexToRgba } from "@/lib/utils"; // Importar a nova função

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
    const storeHeaderColor = getStoreSidebarColor(order.store);

    return (
        <div 
            onClick={handleNavigate}
            className={cn(
                "hover:shadow-md transition-shadow flex flex-col relative rounded-lg border bg-card cursor-pointer"
            )} 
        >
            <div 
                className="flex items-center justify-between p-3 rounded-t-lg" 
                style={{ background: `linear-gradient(to right, ${storeHeaderColor}, white)` }}
            >
                <div className="font-semibold text-sm text-white truncate pr-2">
                    {order.display_id}
                </div>
                <div className="flex items-center gap-2">
                    <Badge  
                        className="whitespace-nowrap text-xs border-transparent text-white"
                        style={{ backgroundColor: hexToRgba(statusBgColor, 0.6) }}
                    >
                        {order.status}
                    </Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-white hover:bg-white/20"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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

            <div className="flex flex-col flex-grow p-4">
                <div className="flex flex-col space-y-2 flex-grow">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <p className="font-semibold text-base truncate">{order.client}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <p className="text-base truncate">{order.equipment}</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground line-clamp-2">{order.description}</p>
                    </div>
                </div>

                {order.scheduled_date && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 pt-3 border-t">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Agendado: {format(new Date(order.scheduled_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceOrderCard;