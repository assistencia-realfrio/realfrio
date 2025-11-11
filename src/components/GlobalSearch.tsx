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
      <CommandInput placeholder="PESQUISAR CLIENTES, OS, EQUIPAMENTOS..." />
      <CommandList>
        <CommandEmpty>{isLoading ? "A CARREGAR..." : "NENHUM RESULTADO ENCONTRADO."}</CommandEmpty>
        
        {!isLoadingClients && clients.length > 0 && (
          <CommandGroup heading="CLIENTES">
            {clients.map((client) => (
              <CommandItem
                key={`client-${client.id}`}
                value={`CLIENTE ${client.name}`}
                onSelect={() => runCommand(() => navigate(`/clients/${client.id}`))}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>{client.name.toUpperCase()}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!isLoadingOrders && orders.length > 0 && (
          <CommandGroup heading="ORDENS DE SERVIÇO">
            {orders.map((order) => (
              <CommandItem
                key={`order-${order.id}`}
                value={`OS ${order.display_id} ${order.client} ${order.equipment}`}
                onSelect={() => runCommand(() => navigate(`/orders/${order.id}`))}
              >
                <Wrench className="mr-2 h-4 w-4" />
                <span>{order.display_id.toUpperCase()} - {order.client.toUpperCase()}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!isLoadingEquipments && equipments.length > 0 && (
          <CommandGroup heading="EQUIPAMENTOS">
            {equipments.map((equipment) => (
              <CommandItem
                key={`equipment-${equipment.id}`}
                value={`EQUIPAMENTO ${equipment.name} ${equipment.client_name}`}
                onSelect={() => runCommand(() => navigate(`/equipments/${equipment.id}`))}
              >
                <HardDrive className="mr-2 h-4 w-4" />
                <span>{equipment.name.toUpperCase()} ({equipment.client_name.toUpperCase()})</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};