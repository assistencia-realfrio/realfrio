import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ClientForm, { ClientFormValues } from "./ClientForm";
import { Client, useClients } from "@/hooks/useClients";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Edit, Phone, Mail, MapPin, FileText } from "lucide-react"; // Adicionado FileText
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Importando Tabs
import ClientOrdersTab from "./ClientOrdersTab"; // Importando o novo componente

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

// Componente de Visualização dos Detalhes do Cliente
const ClientDetailsView: React.FC<{ client: Client, onEdit: () => void }> = ({ client, onEdit }) => {
    return (
        <div className="space-y-4 text-sm">
            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                </Button>
            </div>
            <div>
              <p className="text-muted-foreground">Nome</p>
              <p className="font-medium">{client.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Loja</p>
              <p className="font-medium">{client.store || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Localidade</p>
              <p className="font-medium">{client.locality || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Maps</p>
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
    );
};

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ clientId, isOpen, onOpenChange }) => {
  const { clients, isLoading, updateClient } = useClients();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // Estado para controlar a aba ativa
  
  const client = clientId ? clients.find(c => c.id === clientId) : undefined;

  // Resetar estados ao fechar o modal
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setIsEditing(false);
        setActiveTab("details");
    }
    onOpenChange(open);
  };

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
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Carregando Cliente...</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
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
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
    maps_link: client.maps_link || "",
    locality: client.locality || "",
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"> {/* Aumentado o tamanho máximo do modal */}
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {client.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">
                    <FileText className="h-4 w-4 mr-2" />
                    Detalhes
                </TabsTrigger>
                <TabsTrigger value="orders">
                    <Edit className="h-4 w-4 mr-2" />
                    Ordens de Serviço ({client.totalOrders})
                </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
                {isEditing ? (
                    <ClientForm 
                        initialData={initialFormData} 
                        onSubmit={handleFormSubmit} 
                        onCancel={handleCancelEdit} 
                    />
                ) : (
                    <ClientDetailsView client={client} onEdit={() => setIsEditing(true)} />
                )}
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
                <ClientOrdersTab clientId={client.id} />
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsModal;