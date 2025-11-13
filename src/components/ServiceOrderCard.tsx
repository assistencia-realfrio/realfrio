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
import { Check, MoreHorizontal, Calendar as CalendarIcon, User, HardDrive, FileText } from "lucide-react"; // Importados os novos ícones
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

            <div className="flex flex-col flex-grow p-4">
                <div className="flex items-start justify-between mb-3">
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
                
                <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" /> {/* Ícone para Cliente */}
                        <p className="font-semibold text-base truncate">{order.client}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-muted-foreground flex-shrink-0" /> {/* Ícone para Equipamento */}
                        <p className="text-base truncate">{order.equipment}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" /> {/* Ícone para Descrição */}
                        <p className="text-sm line-clamp-2">{order.description}</p>
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