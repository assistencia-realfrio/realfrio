import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceOrder } from "@/hooks/useServiceOrders";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, HardHat, Tag, MapPin, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { getStatusClass } from "@/lib/serviceOrderStatus";

interface ServiceOrderCardProps {
  order: ServiceOrder;
}

const ServiceOrderCard: React.FC<ServiceOrderCardProps> = ({ order }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/orders/${order.id}`);
  };

  const statusClass = getStatusClass(order.status);

  return (
    <Card 
      className={`relative overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg ${statusClass}`}
      onClick={handleEdit}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold leading-tight">
              {order.client}
            </CardTitle>
            <p className="text-xs text-muted-foreground font-mono pt-1">{order.display_id}</p>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="whitespace-nowrap text-xs px-2 py-0.5 border-current/50 bg-white/20 text-current font-bold">
              {order.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 text-muted-foreground hover:bg-accent rounded-md -mr-2" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={handleEdit}>Ver Detalhes</DropdownMenuItem>
                <DropdownMenuItem>Marcar como Concluída</DropdownMenuItem>
                <DropdownMenuItem>Imprimir Etiqueta</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-2.5 pt-2 pb-4">
        <div className="flex items-center gap-2 text-foreground/80">
          <HardHat className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium truncate">{order.equipment}</span>
        </div>
        {order.model && (
          <div className="flex items-center gap-2 text-foreground/80">
            <Tag className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{order.model}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span>{order.store}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>{new Date(order.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceOrderCard;