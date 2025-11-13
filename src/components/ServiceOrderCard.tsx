import React from "react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ServiceOrder, useServiceOrders, ServiceOrderStatus, serviceOrderStatuses } from "@/hooks/useServiceOrders"; // Import from refactored hook
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
import { Check, MoreHorizontal, Calendar as CalendarIcon } from "lucide-react"; // Importar CalendarIcon
import { showLoading, dismissToast, showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns"; // Importar format
import { ptBR } from "date-fns/locale"; // Importar locale ptBR

interface ServiceOrderCardProps {
    order: ServiceOrder;
}

const getStoreBackgroundColorClass = (store: ServiceOrder['store'] | null) => {
  switch (store) {
    case "CALDAS DA RAINHA":
      return "bg-blue-50"; // Azul muito claro
    case "PORTO DE MÓS":
      return "bg-red-50"; // Vermelho muito claro
    default:
      return "bg-gray-50"; // Cinza muito claro como padrão
  }
};

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
    const { updateOrder } = useServiceOrders(); // Corrected destructuring

    const handleNavigate = () => {
        navigate(`/orders/${order.id}`);
    };

    const handleStatusChange = async (newStatus: ServiceOrderStatus) => {
        const toastId = showLoading(`Alterando estado para ${newStatus}...`);
        try {
            await updateOrder.mutateAsync({
                id: order.id,
                status: newStatus,
                // Ensure all required fields are passed, even if unchanged
                client_id: order.client_id,
                description: order.description,
                store: order.store,
                equipment: order.equipment, // This is the string representation
                model: order.model || null,
                serial_number: order.serial_number || null,
                equipment_id: order.equipment_id || null,
                scheduled_date: order.scheduled_date ? new Date(order.scheduled_date) : null,
                technician_id: order.technician_id || null,
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
    const storeSidebarColor = getStoreSidebarColor(order.store);

    return (
        <div 
            className={cn(
                "hover:shadow-lg transition-shadow flex relative rounded-lg border", // Mantido 'border'
                getStoreBackgroundColorClass(order.store), // Aplica a cor base da loja
                "bg-opacity-75" // Aumentado para 75% de opacidade
            )} 
        >
            {/* Barra esquerda para a loja */}
            <div className="w-2 rounded-l-md" style={{ backgroundColor: storeSidebarColor }} />

            <div className="flex flex-col flex-grow p-2 rounded-r-md"> {/* Reduzido p-3 para p-2 */}
                <div className="flex flex-row items-start justify-between space-y-0 pb-0.5"> {/* Reduzido pb-1 para pb-0.5 */}
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
                <div onClick={handleNavigate} className="cursor-pointer pt-1 flex flex-col flex-grow space-y-1"> {/* Reduzido pt-2 para pt-1 e space-y-1.5 para space-y-1 */}
                    <div className="flex items-center gap-1"> {/* Reduzido gap-2 para gap-1 */}
                        <div className={cn("h-1 w-1 rounded-full flex-shrink-0 bg-foreground")} />
                        <div className={cn("text-base font-bold truncate text-foreground")}> {/* Reduzido text-lg para text-base */}
                            {order.client_name} {/* Use client_name */}
                        </div>
                    </div>

                    <div className="flex items-center gap-1"> {/* Reduzido gap-2 para gap-1 */}
                        <div className={cn("h-1 w-1 rounded-full flex-shrink-0 bg-foreground")} />
                        <p className={cn("text-sm truncate text-foreground")}> {/* Reduzido text-base para text-sm */}
                            {order.equipment_name} {/* Use equipment_name */}
                        </p>
                    </div>
                    
                    <div className="flex items-start gap-1"> {/* Reduzido gap-2 para gap-1 */}
                        <div className={cn("h-1 w-1 rounded-full flex-shrink-0 mt-1 bg-foreground")} /> {/* Reduzido mt-2 para mt-1 */}
                        <p className={cn("text-xs line-clamp-2 flex-grow text-muted-foreground")}> {/* Reduzido text-sm para text-xs e line-clamp-3 para line-clamp-2 */}
                            {order.description}
                        </p>
                    </div>
                    {order.scheduled_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0"> {/* Reduzido gap-2 para gap-1 e mt-1 para mt-0 */}
                            <CalendarIcon className="h-3 w-3 flex-shrink-0" />
                            <span>Agendado para: {format(new Date(order.scheduled_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceOrderCard;