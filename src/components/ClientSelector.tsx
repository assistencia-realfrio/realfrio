"use client";

import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ClientForm, { ClientFormData, Client } from "./ClientForm";
import { showSuccess, showError } from '@/utils/toast';
import { useClients, useCreateClient } from '@/hooks/useClients';

interface ClientSelectorProps {
  selectedClientId: string | null;
  onClientSelect: (clientId: string) => void;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({ selectedClientId, onClientSelect }) => {
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: clients, isLoading } = useClients();
  const createClientMutation = useCreateClient();

  const selectedClient = useMemo(() => {
    return clients?.find(client => client.id === selectedClientId);
  }, [clients, selectedClientId]);

  const handleNewClientSubmit = async (data: ClientFormData) => {
    try {
      const newClient = await createClientMutation.mutateAsync(data);
      showSuccess('Client created successfully!');
      onClientSelect(newClient.id);
      setIsModalOpen(false);
      setOpen(false);
    } catch (e) {
      console.error('Error creating client:', e);
      showError('Failed to create client.');
    }
  };

  if (isLoading) {
    return <Button variant="outline" disabled>Loading clients...</Button>;
  }

  return (
    <div className="flex items-center space-x-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {selectedClient ? selectedClient.name : "Select client..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search client..." />
            <CommandList>
              <CommandEmpty>No client found.</CommandEmpty>
              <CommandGroup>
                {clients?.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.name}
                    onSelect={() => {
                      onClientSelect(client.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedClientId === client.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {client.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup>
                <CommandItem onSelect={() => setIsModalOpen(true)} className="text-blue-600">
                  <Plus className="mr-2 h-4 w-4" /> Create New Client
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
          </DialogHeader>
          <ClientForm 
            onSubmit={handleNewClientSubmit}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};