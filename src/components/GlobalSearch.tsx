import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useClients } from '@/hooks/useClients';
import { useServiceOrders } from '@/hooks/useServiceOrders';
import { useAllEquipments } from '@/hooks/useAllEquipments';
import { useAllEstablishments } from '@/hooks/useAllEstablishments';
import { Users, Wrench, HardDrive, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Importar Badge
import { getStatusBadgeVariant } from '@/lib/serviceOrderStatus'; // Importar função para variante do badge

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { clients, isLoading: isLoadingClients } = useClients();
  const { orders, isLoading: isLoadingOrders } = useServiceOrders();
  const { equipments, isLoading: isLoadingEquipments } = useAllEquipments();
  const { establishments, isLoading: isLoadingEstablishments } = useAllEstablishments();

  const runCommand = (command: () => unknown) => {
    onOpenChange(false);
    command();
  };

  const isLoading = isLoadingClients || isLoadingOrders || isLoadingEquipments || isLoadingEstablishments;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Pesquisar clientes, OS, equipamentos, estabelecimentos..." />
      <CommandList>
        <CommandEmpty>{isLoading ? "A carregar..." : "Nenhum resultado encontrado."}</CommandEmpty>
        
        {!isLoadingClients && clients.length > 0 && (
          <CommandGroup heading="Clientes">
            {clients.map((client) => (
              <CommandItem
                key={`client-${client.id}`}
                value={`Cliente ${client.name} ${client.billing_name || ''}`}
                onSelect={() => runCommand(() => navigate(`/clients/${client.id}`))}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>{client.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!isLoadingEstablishments && establishments.length > 0 && (
          <CommandGroup heading="Estabelecimentos">
            {establishments.map((establishment) => (
              <CommandItem
                key={`establishment-${establishment.id}`}
                value={`Estabelecimento ${establishment.name} ${establishment.client_name} ${establishment.locality || ''}`}
                onSelect={() => runCommand(() => navigate(`/clients/${establishment.client_id}?tab=establishments`))}
              >
                <Building className="mr-2 h-4 w-4" />
                <span>{establishment.name} ({establishment.client_name})</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!isLoadingOrders && orders.length > 0 && (
          <CommandGroup heading="Ordens de Serviço">
            {orders.map((order) => (
              <CommandItem
                key={`order-${order.id}`}
                value={`OS ${order.display_id} ${order.client} ${order.equipment} ${order.status}`}
                onSelect={() => runCommand(() => navigate(`/orders/${order.id}`))}
                className="flex items-center justify-between"
              >
                <div className="flex items-center min-w-0 flex-grow">
                  <Wrench className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {order.display_id} - {order.client} ({order.equipment})
                  </span>
                </div>
                <Badge variant={getStatusBadgeVariant(order.status)} className="ml-2 flex-shrink-0">
                  {order.status}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!isLoadingEquipments && equipments.length > 0 && (
          <CommandGroup heading="Equipamentos">
            {equipments.map((equipment) => (
              <CommandItem
                key={`equipment-${equipment.id}`}
                value={`Equipamento ${equipment.name} ${equipment.client_name} ${equipment.establishment_name || ''}`}
                onSelect={() => runCommand(() => navigate(`/equipments/${equipment.id}`))}
              >
                <HardDrive className="mr-2 h-4 w-4" />
                <span>{equipment.name} ({equipment.client_name}{equipment.establishment_name ? ` - ${equipment.establishment_name}` : ''})</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};