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
import { Users, Wrench, HardDrive } from 'lucide-react';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { clients, isLoading: isLoadingClients } = useClients();
  const { orders, isLoading: isLoadingOrders } = useServiceOrders();
  const { equipments, isLoading: isLoadingEquipments } = useAllEquipments();

  const runCommand = (command: () => unknown) => {
    onOpenChange(false);
    command();
  };

  const isLoading = isLoadingClients || isLoadingOrders || isLoadingEquipments;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Pesquisar clientes, OS, equipamentos..." />
      <CommandList>
        <CommandEmpty>{isLoading ? "A carregar..." : "Nenhum resultado encontrado."}</CommandEmpty>
        
        {!isLoadingClients && clients.length > 0 && (
          <CommandGroup heading="Clientes">
            {clients.map((client) => (
              <CommandItem
                key={`client-${client.id}`}
                value={`Cliente ${client.name}`}
                onSelect={() => runCommand(() => navigate(`/clients/${client.id}`))}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>{client.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!isLoadingOrders && orders.length > 0 && (
          <CommandGroup heading="Ordens de Serviço">
            {orders.map((order) => (
              <CommandItem
                key={`order-${order.id}`}
                value={`OS ${order.display_id} ${order.client} ${order.equipment}`}
                onSelect={() => runCommand(() => navigate(`/orders/${order.id}`))}
              >
                <Wrench className="mr-2 h-4 w-4" />
                <span>{order.display_id} - {order.client}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!isLoadingEquipments && equipments.length > 0 && (
          <CommandGroup heading="Equipamentos">
            {equipments.map((equipment) => (
              <CommandItem
                key={`equipment-${equipment.id}`}
                value={`Equipamento ${equipment.name} ${equipment.client_name}`}
                onSelect={() => runCommand(() => navigate(`/equipments/${equipment.id}`))}
              >
                <HardDrive className="mr-2 h-4 w-4" />
                <span>{equipment.name} ({equipment.client_name})</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};