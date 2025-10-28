import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Check } from "lucide-react";
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
                        className="text-xs font-medium text-current/80 truncate cursor-pointer"
                        onClick={handleNavigate}
                    >
                        {order.display_id}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Badge 
                                variant="outline" 
                                className="cursor-pointer whitespace-nowrap text-xs px-2 py-0.5 border-current/50 bg-white/20 text-current font-bold"
                            >
                                {order.status}
                            </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                <div onClick={handleNavigate} className="cursor-pointer pt-2 flex flex-col flex-grow space-y-1.5 text-current">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-current flex-shrink-0" />
                        <div className="text-lg font-bold truncate">
                            {order.client}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-current flex-shrink-0" />
                        <p className="text-base truncate">
                            {order.equipment}
                        </p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                        <div className="h-1 w-1 rounded-full bg-current flex-shrink-0 mt-2" />
                        <p className="text-sm opacity-80 line-clamp-3 flex-grow">
                            {order.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceOrderCard;