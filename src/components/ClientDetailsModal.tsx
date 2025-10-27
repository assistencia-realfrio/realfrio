import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ClientForm, { ClientFormValues } from "./ClientForm";
import { Client, useClients } from "@/hooks/useClients";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientDetailsModalProps {
  clientId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ clientId, isOpen, onOpenChange }) => {
  const { clients, isLoading, updateClient } = useClients(); // Usando useClients para buscar e atualizar
  
  // Encontra o cliente selecionado na lista
  const client = clientId ? clients.find(c => c.id === clientId) : undefined;

  const handleFormSubmit = async (data: ClientFormValues) => {
    if (!client?.id) return;
    try {
      await updateClient.mutateAsync({ id: client.id, ...data });
      showSuccess(`Cliente ${data.name} atualizado com sucesso!`);
      onOpenChange(false); // Fecha o modal após a atualização
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      showError("Erro ao atualizar cliente. Tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Carregando Cliente...</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!client) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cliente Não Encontrado</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-4">Não foi possível carregar os detalhes do cliente.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const initialFormData: ClientFormValues = {
    name: client.name,
    contact: client.contact || "",
    email: client.email || "",
    store: client.store || "CALDAS DA RAINHA",
    address: client.address || "",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente: {client.name}</DialogTitle>
        </DialogHeader>
        <ClientForm 
          initialData={initialFormData} 
          onSubmit={handleFormSubmit} 
          onCancel={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsModal;