import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ClientForm, { ClientFormValues } from "@/components/ClientForm";
import { Client, useClients } from "@/hooks/useClients";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Trash2, FolderOpen, PlusCircle, X, Building, Wrench, ArrowRight, FileText } from "lucide-react";
import ClientOrdersTab from "@/components/ClientOrdersTab";
import ClientEquipmentTab from "@/components/ClientEquipmentTab";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ClientDetailsBottomNav from "@/components/ClientDetailsBottomNav";
import ActivityLog from "@/components/ActivityLog";
import { Card, CardContent } from "@/components/ui/card";
import { isLinkClickable } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EquipmentForm from "@/components/EquipmentForm";
import ClientEstablishmentsTab from "@/components/ClientEstablishmentsTab";
import EstablishmentForm from "@/components/EstablishmentForm";
import { useClientEstablishments } from "@/hooks/useClientEstablishments";
import ClientHeader from "@/components/ClientHeader"; // Importar o novo componente

const ClientDetailsView: React.FC<{ client: Client }> = ({ client }) => {
    const hasGoogleDriveLink = client.google_drive_link && client.google_drive_link.trim() !== '';

    const getMapHref = (mapsLink: string) => {
      if (!mapsLink) return "#";
      if (mapsLink.startsWith("http://") || mapsLink.startsWith("https://")) {
        return mapsLink;
      }
      if (/^-?\d+\.\d+,\s*-?\d+\.\d+/.test(mapsLink)) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsLink)}`;
      }
      return "#";
    };

    return (
        <Card className="shadow-sm">
            <CardContent className="p-0">
                {/* Item: Nome de Faturação */}
                <div className="flex items-center gap-4 py-3 px-4 border-b">
                    <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{client.billing_name || 'Nome de faturação não definido'}</p>
                    </div>
                </div>

                {/* Item: Localização */}
                <div className="flex items-center gap-4 py-3 px-4 border-b">
                    <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{client.locality || 'Localidade não definida'}</p>
                        {client.maps_link && isLinkClickable(client.maps_link) && (
                            <a 
                                href={getMapHref(client.maps_link)}
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline text-xs"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Ver no Mapa
                            </a>
                        )}
                    </div>
                    {client.maps_link && isLinkClickable(client.maps_link) && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                </div>

                {/* Item: Contato (Telefone) */}
                <div className="flex items-center gap-4 py-3 px-4 border-b">
                    <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Phone className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        {client.contact ? (
                            <a href={`tel:${client.contact}`} className="font-medium text-sm text-foreground hover:underline" onClick={(e) => e.stopPropagation()}>
                                {client.contact}
                            </a>
                        ) : (
                            <p className="font-medium text-sm text-muted-foreground">N/A</p>
                        )}
                    </div>
                    {client.contact && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                </div>

                {/* Item: E-mail */}
                <div className="flex items-center gap-4 py-3 px-4 border-b">
                    <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        {client.email ? (
                            <a href={`mailto:${client.email}`} className="font-medium text-sm text-foreground hover:underline" onClick={(e) => e.stopPropagation()}>
                                {client.email}
                            </a>
                        ) : (
                            <p className="font-medium text-sm text-muted-foreground">N/A</p>
                        )}
                    </div>
                    {client.email && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                </div>

                {/* Item: Google Drive */}
                <div className="flex items-center gap-4 py-3 px-4">
                    <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FolderOpen className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        {hasGoogleDriveLink ? (
                            <a 
                                href={client.google_drive_link!} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="font-medium text-sm text-foreground hover:underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Documentos no Google Drive
                            </a>
                        ) : (
                            <p className="font-medium text-sm text-muted-foreground">Nenhum documento no Google Drive</p>
                        )}
                    </div>
                    {hasGoogleDriveLink && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, isLoading, updateClient, deleteClient } = useClients(); 
  const { createEstablishment } = useClientEstablishments(id || "");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedView, setSelectedView] = useState<'details' | 'orders' | 'equipments' | 'establishments'>("details");
  const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);
  const [isAddEstablishmentModalOpen, setIsAddEstablishmentModalOpen] = useState(false);

  const client = id ? clients.find(c => c.id === id) : undefined;

  const handleFormSubmit = async (data: ClientFormValues) => {
    if (!client?.id) return;
    try {
      await updateClient.mutateAsync({ id: client.id, ...data });
      showSuccess(`Cliente ${data.name} atualizado com sucesso!`);
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      showError("Erro ao atualizar cliente. Tente novamente.");
    }
  };

  const handleDeleteClient = async () => {
    if (!client?.id || !client.name) return;
    try {
        await deleteClient.mutateAsync(client.id);
        showSuccess(`Cliente ${client.name} removido com sucesso.`);
        navigate('/clients', { replace: true });
    } catch (error) {
        console.error("Erro ao deletar cliente:", error);
        showError("Erro ao deletar cliente. Tente novamente.");
    }
  };

  const handleNewEquipmentSuccess = () => {
    setIsAddEquipmentModalOpen(false);
    showSuccess("Equipamento adicionado com sucesso!");
  };

  const handleNewEstablishmentSubmit = async (data: any) => {
    try {
      await createEstablishment.mutateAsync(data);
      showSuccess("Estabelecimento criado com sucesso!");
      setIsAddEstablishmentModalOpen(false);
    } catch (error) {
      showError("Erro ao criar estabelecimento.");
    }
  };
  
  // Função para navegar para a criação de nova OS, pré-selecionando o cliente
  const handleNewOrder = () => {
    if (client?.id) {
      // Poderíamos passar o ID do cliente via state ou query params, mas por enquanto,
      // apenas navegamos para a página de criação. O seletor de cliente será o primeiro campo.
      navigate(`/orders/new?clientId=${client.id}`);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Cliente não encontrado</h2>
          <p className="text-muted-foreground">O cliente com ID {id} não existe ou você não tem permissão para vê-lo.</p>
          <Button onClick={() => navigate('/clients')} className="mt-4">Voltar para Clientes</Button>
        </div>
      </Layout>
    );
  }

  const initialFormData: ClientFormValues = {
    name: client.name,
    billing_name: client.billing_name || "", // NOVO: Adicionando billing_name
    contact: client.contact || "",
    email: client.email || "",
    store: client.store || "CALDAS DA RAINHA",
    maps_link: client.maps_link || "",
    locality: client.locality || "",
    google_drive_link: client.google_drive_link || "",
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20"> {/* ADICIONADO pb-20 AQUI */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {/* Título do cliente removido conforme solicitado */}
          </div>
          
          <div className="flex flex-shrink-0 space-x-2">
            {selectedView === 'details' && (
              <>
                {isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(false)} size="icon" className="sm:hidden" aria-label="Cancelar Edição">
                        <X className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button variant="outline" onClick={() => setIsEditing(true)} size="icon" className="sm:hidden" aria-label="Editar">
                        <Edit className="h-4 w-4" />
                    </Button>
                )}
                
                {isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="hidden sm:flex">
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                    </Button>
                ) : (
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="hidden sm:flex">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                )}
                
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button 
                            variant="destructive" 
                            disabled={deleteClient.isPending}
                            aria-label="Excluir Cliente"
                            className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-10 sm:px-4"
                        >
                            <Trash2 className="h-4 w-4 mr-0 sm:mr-2" />
                            <span className="hidden sm:inline">Excluir</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente 
                                <span className="font-semibold"> {client.name}</span> e todos os dados associados.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleDeleteClient} 
                                className="bg-destructive hover:bg-destructive/90"
                                disabled={deleteClient.isPending}
                            >
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        {/* Novo ClientHeader */}
        <ClientHeader client={client} />

        {selectedView === 'details' && (
          <>
            {isEditing ? (
              <Card>
                <CardContent className="pt-6">
                  <ClientForm 
                    initialData={initialFormData} 
                    onSubmit={handleFormSubmit} 
                    onCancel={() => setIsEditing(false)} 
                  />
                </CardContent>
              </Card>
            ) : (
              <ClientDetailsView client={client} />
            )}
          </>
        )}

        {selectedView === 'orders' && (
          <ClientOrdersTab clientId={client.id} />
        )}

        {selectedView === 'equipments' && (
          <ClientEquipmentTab clientId={client.id} />
        )}

        {selectedView === 'establishments' && (
          <ClientEstablishmentsTab clientId={client.id} />
        )}
      </div>
      <ClientDetailsBottomNav
        selectedView={selectedView}
        onSelectView={setSelectedView}
      />

      {/* Botão Flutuante para Nova OS (Aba Ordens) */}
      {selectedView === 'orders' && (
        <Button
          onClick={handleNewOrder}
          className="fixed bottom-24 right-6 h-16 w-16 rounded-full shadow-lg z-50"
          aria-label="Nova Ordem de Serviço"
        >
          <Wrench className="h-8 w-8" />
        </Button>
      )}

      {/* Botão Flutuante para Adicionar Equipamento (Aba Equipamentos) */}
      {selectedView === 'equipments' && (
        <Dialog open={isAddEquipmentModalOpen} onOpenChange={setIsAddEquipmentModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="fixed bottom-24 right-6 h-16 w-16 rounded-full shadow-lg z-50"
              aria-label="Adicionar Equipamento"
            >
              <PlusCircle className="h-8 w-8" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Equipamento</DialogTitle>
            </DialogHeader>
            <EquipmentForm 
              clientId={client.id} 
              onSubmit={handleNewEquipmentSuccess} 
              onCancel={() => setIsAddEquipmentModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Botão Flutuante para Adicionar Estabelecimento (Aba Estabelecimentos) */}
      {selectedView === 'establishments' && (
        <Dialog open={isAddEstablishmentModalOpen} onOpenChange={setIsAddEstablishmentModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="fixed bottom-24 right-6 h-16 w-16 rounded-full shadow-lg z-50"
              aria-label="Adicionar Estabelecimento"
            >
              <Building className="h-8 w-8" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Estabelecimento</DialogTitle>
            </DialogHeader>
            <EstablishmentForm
              clientId={client.id}
              onSubmit={handleNewEstablishmentSubmit}
              onCancel={() => setIsAddEstablishmentModalOpen(false)}
              isPending={createEstablishment.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default ClientDetails;