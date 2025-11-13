import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceOrder } from "@/hooks/useServiceOrders";
import { getStatusBadgeVariant } from "@/lib/serviceOrderStatus";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Store, Wrench, User } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface ServiceOrderDetailsViewProps {
  order: ServiceOrder;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode; icon: React.ElementType }> = ({ label, value, icon: Icon }) => (
  <div>
    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Icon className="h-3 w-3" /> {label}</p>
    <p className="font-medium">{value || 'N/A'}</p>
  </div>
);

const ServiceOrderDetailsView: React.FC<ServiceOrderDetailsViewProps> = ({ order }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Detalhes da OS</CardTitle>
          <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailItem label="Loja" value={order.store} icon={Store} />
          {order.scheduled_date && (
            <DetailItem 
              label="Data Agendada" 
              value={format(new Date(order.scheduled_date), "PPP", { locale: ptBR })} 
              icon={CalendarIcon} 
            />
          )}
        </div>
        
        <div className="space-y-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5"><User className="h-3 w-3" /> Cliente</p>
            <Button variant="link" className="p-0 h-auto font-medium text-base" onClick={() => navigate(`/clients/${order.client_id}`)}>
                {order.client}
            </Button>
        </div>

        <div className="space-y-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Wrench className="h-3 w-3" /> Equipamento</p>
            <Button variant="link" className="p-0 h-auto font-medium text-base" onClick={() => navigate(`/equipments/${order.equipment_id}`)}>
                {order.equipment}
            </Button>
            <p className="text-xs text-muted-foreground">
                {order.model && `Modelo: ${order.model}`}
                {order.model && order.serial_number && ' • '}
                {order.serial_number && `S/N: ${order.serial_number}`}
            </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Descrição do Serviço</p>
          <p className="font-medium whitespace-pre-wrap">{order.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceOrderDetailsView;