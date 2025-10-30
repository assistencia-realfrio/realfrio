import React from "react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ServiceOrder, useServiceOrders, serviceOrderStatuses, ServiceOrderStatus } from "@/hooks/useServiceOrders";
import { statusChartColors } from "@/lib/serviceOrderStatus"; // Importando statusChartColors
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, MoreHorizontal } from "lucide-react";
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
    
    const storeTextColorClass = order.store === 'CALDAS DA RAINHA' 
        ? 'text-blue-700 dark:text-blue-300' 
        : 'text-red-700 dark:text-red-300';

    const statusBgColor = statusChartColors[order.status];

    return (
        <div 
            className={cn(
                "hover:shadow-lg transition-shadow flex relative rounded-lg bg-card border" // Adicionado 'border' para o contorno
            )} 
        >
            {/* Barra esquerda para o status */}
            <div className="w-2 rounded-l-md" style={{ backgroundColor: statusBgColor }} />

            <div className="flex flex-col flex-grow p-3 rounded-r-md"> {/* Adicionado rounded-r-md aqui */}
                <div className="flex flex-row items-start justify-between space-y-0 pb-1">
                    <div 
                        className={cn("text-xs font-medium truncate cursor-pointer", storeTextColorClass)} // Aplicando a cor da loja ao texto do ID da OS
                        onClick={handleNavigate}
                    >
                        {order.display_id}
                    </div>
                    <div className="flex items-center gap-1">
                        <Badge  
                            variant="outline" 
                            className={cn("whitespace-nowrap text-xs px-2 py-0.5 bg-background/50 font-bold text-foreground")} // Removido border-border
                            style={{ borderColor: statusBgColor }} // Aplicando a cor do status ao contorno
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
                <div onClick={handleNavigate} className="cursor-pointer pt-2 flex flex-col flex-grow space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className={cn("h-1 w-1 rounded-full flex-shrink-0 bg-foreground")} />
                        <div className={cn("text-lg font-bold truncate text-foreground")}>
                            {order.client}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={cn("h-1 w-1 rounded-full flex-shrink-0 bg-foreground")} />
                        <p className={cn("text-base truncate text-foreground")}>
                            {order.equipment}
                        </p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                        <div className={cn("h-1 w-1 rounded-full flex-shrink-0 mt-2 bg-foreground")} />
                        <p className={cn("text-sm line-clamp-3 flex-grow text-muted-foreground")}>
                            {order.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceOrderCard;