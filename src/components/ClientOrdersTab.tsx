import { useQuery } from "react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceOrder } from "@/hooks/useServiceOrders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusBadgeVariant, isActiveStatus } from "@/lib/serviceOrderStatus";

interface ClientOrdersTabProps {
  clientId: string;
}

const fetchClientOrders = async (clientId: string): Promise<ServiceOrder[]> => {
  const { data, error } = await supabase
    .from("service_orders")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data as ServiceOrder[];
};

const ClientOrdersTab: React.FC<ClientOrdersTabProps> = ({ clientId }) => {
  const { data: orders, isLoading, error } = useQuery(
    ["clientOrders", clientId],
    () => fetchClientOrders(clientId)
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">Erro ao carregar as ordens de serviço.</div>;
  }

  if (!orders || orders.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhuma ordem de serviço encontrada para este cliente.</div>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">ID</TableHead>
            <TableHead>Equipamento</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Data de Criação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">OS-{order.id.split('-')[0].toUpperCase()}</TableCell>
              <TableCell className="font-medium">{order.equipment}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
              </TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Link to={`/orders/${order.id}`} className="text-primary hover:underline inline-flex items-center gap-1.5">
                  Ver
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientOrdersTab;