import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ClientForm, { ClientFormValues } from "./ClientForm";
import { Client, useClients } from "@/hooks/useClients";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Edit, Phone, Mail, MapPin } from "lucide-react"; // Importando ícones

interface ClientDetailsModalProps {
  clientId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Função auxiliar para verificar se o link é do Google Maps ou coordenadas
const isGoogleMapsLink = (mapsLink: string | null): boolean => {
  if (!mapsLink) return false;
  // Verifica se é uma URL do Google Maps ou um par de coordenadas (lat, long)
  return mapsLink.includes("google.com/maps") || /^-?\d+\.\d+,\s*-?\d+\.\d+/.test(mapsLink);
};

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ clientId, isOpen, onOpenChange }) => {
  const { clients, isLoading, updateClient } = useClients();
  const [isEditing, setIsEditing] = useState(false); // Estado para controlar o modo de edição
  
  const client = clientId ? clients.find(c => c.id === clientId) : undefined;

  const handleFormSubmit = async (data: ClientFormValues) => {
    if (!client?.id) return;
    try {
      await updateClient.mutateAsync({ id: client.id, ...data });
      showSuccess(`Cliente ${data.name} atualizado com sucesso!`);
      setIsEditing(false); // Volta para o modo de visualização após salvar
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      showError("Erro ao atualizar cliente. Tente novamente.");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Volta para o modo de visualização
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
    maps_link: client.maps_link || "", // Usando maps_link
    locality: client.locality || "", // Usando locality
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold">
            {isEditing ? `Editar Cliente: ${client.name}` : `Detalhes do Cliente: ${client.name}`}
          </DialogTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </DialogHeader>

        {isEditing ? (
          <ClientForm 
            initialData={initialFormData} 
            onSubmit={handleFormSubmit} 
            onCancel={handleCancelEdit} 
          />
        ) : (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Nome</p>
              <p className="font-medium">{client.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Loja</p>
              <p className="font-medium">{client.store || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Localidade</p> {/* Novo campo Localidade */}
              <p className="font-medium">{client.locality || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Maps</p> {/* Campo Maps */}
              {client.maps_link ? (
                isGoogleMapsLink(client.maps_link) ? (
                  <a 
                    href={client.maps_link.startsWith("http") ? client.maps_link : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.maps_link)}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <MapPin className="h-4 w-4" />
                    Ver no Mapa
                  </a>
                ) : (
                  <p className="font-medium">{client.maps_link}</p>
                )
              ) : (
                <p className="text-muted-foreground">N/A</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">Contato</p>
              {client.contact ? (
                <a href={`tel:${client.contact}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Phone className="h-4 w-4" />
                  {client.contact}
                </a>
              ) : (
                <p className="text-muted-foreground">N/A</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">E-mail</p>
              {client.email ? (
                <a href={`mailto:${client.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Mail className="h-4 w-4" />
                  {client.email}
                </a>
              ) : (
                <p className="text-muted-foreground">N/A</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsModal;