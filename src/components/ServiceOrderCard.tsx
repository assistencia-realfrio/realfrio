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
import { Button } from "@/components/ui/button";
import { MoreVertical, Check } from "lucide-react";
import { showLoading, dismissToast, showSuccess, showError } from "@/utils/toast";

interface ServiceOrderCardProps {
    order: ServiceOrder;
}

const ServiceOrderCard: React.FC<ServiceOrderCardProps> = ({ order }) => {
    const navigate = useNavigate();
    const { updateOrder } = useServiceOrders();

    const handleClick = () => {
        navigate(`/orders/${order.id}`);
    };

    const handleStatusChange = async (newStatus: ServiceOrderStatus) => {
        const toastId = showLoading(`Alterando estado para ${newStatus}...`);
        try {
            // A mutação espera o formato completo, então passamos o objeto da ordem, apenas alterando o estado
            await updateOrder.mutateAsync({
                ...order,
                status: newStatus,
                // Garantir que os campos opcionais sejam passados como undefined se forem null
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
        <Card 
            className={cn(
                "hover:shadow-lg transition-shadow cursor-pointer flex",
                "p-0 border-0 rounded-lg",
                statusCardClasses[order.status] || "status-cancelada"
            )} 
            onClick={handleClick}
        >
            <div className={cn("w-2 rounded-l-md", storeColorClass)} />

            <div className="flex flex-col flex-grow p-3">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 p-0 pb-1">
                    <div className="text-xs font-medium text-current/80 truncate">{order.display_id}</div>
                    <div className="flex items-center gap-1">
                        <Badge variant="outline" className="whitespace-nowrap text-xs px-2 py-0.5 border-current/50 bg-white/20 text-current">
                            {order.status}
                        </Badge>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-current hover:bg-white/30">
                                    <MoreVertical className="h-4 w-4" />
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
                </CardHeader>
                <CardContent className="p-0 pt-2 flex flex-col flex-grow space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-current/70 flex-shrink-0" />
                        <CardTitle className="text-lg font-bold text-current truncate">
                            {order.client}
                        </CardTitle>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-current/70 flex-shrink-0" />
                        <p className="text-base text-current truncate">
                            {order.equipment}
                        </p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-current/70 flex-shrink-0 mt-1.5" />
                        <p className="text-sm text-current/80 line-clamp-3 flex-grow">
                            {order.description}
                        </p>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
};

export default ServiceOrderCard;