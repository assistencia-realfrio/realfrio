import React from "react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ServiceOrder, useServiceOrders, serviceOrderStatuses, ServiceOrderStatus } from "@/hooks/useServiceOrders";
import { statusCardClasses } from "@/lib/serviceOrderStatus";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, MoreHorizontal } from "lucide-react"; // Importando MoreHorizontal
import { showLoading, dismissToast, showSuccess, showError } from "@/utils/toast";

interface ServiceOrderCardProps {
    order: ServiceOrder;
}

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
            });
            dismissToast(toastId);
            showSuccess("Estado da OS alterado com sucesso!");
        } catch (error) {
            dismissToast(toastId);
            showError("Erro ao alterar o estado da OS.");
            console.error("Status update error:", error);
        }
    };
    
    const storeColorClass = order.store === 'CALDAS DA RAINHA' 
        ? 'bg-blue-500' 
        : 'bg-red-500';

    // Classes de texto para garantir a cor correta, independentemente do estado
    const textClass = "text-slate-800";
    const mutedTextClass = "text-slate-600";

    return (
        <div 
            className={cn(
                "hover:shadow-lg transition-shadow flex relative rounded-lg",
                statusCardClasses[order.status] || "status-cancelada"
            )} 
        >
            <div className={cn("w-2 rounded-l-md", storeColorClass)} />

            <div className="flex flex-col flex-grow p-3">
                <div className="flex flex-row items-start justify-between space-y-0 pb-1">
                    <div 
                        className={cn("text-xs font-medium truncate cursor-pointer", mutedTextClass)}
                        onClick={handleNavigate}
                    >
                        {order.display_id}
                    </div>
                    <div className="flex items-center gap-1"> {/* Container para o Badge e o Dropdown */}
                        <Badge 
                            variant="outline" 
                            className={cn("whitespace-nowrap text-xs px-2 py-0.5 border-slate-400/50 bg-white/30 font-bold", textClass)}
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
                                    <MoreHorizontal className="h-4 w-4 text-slate-600" />
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
                <div onClick={handleNavigate} className="cursor-pointer pt-2 flex flex-col flex-grow space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className={cn("h-1 w-1 rounded-full flex-shrink-0 bg-slate-800")} />
                        <div className={cn("text-lg font-bold truncate", textClass)}>
                            {order.client}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={cn("h-1 w-1 rounded-full flex-shrink-0 bg-slate-800")} />
                        <p className={cn("text-base truncate", textClass)}>
                            {order.equipment}
                        </p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                        <div className={cn("h-1 w-1 rounded-full flex-shrink-0 mt-2 bg-slate-800")} />
                        <p className={cn("text-sm line-clamp-3 flex-grow", mutedTextClass)}>
                            {order.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceOrderCard;