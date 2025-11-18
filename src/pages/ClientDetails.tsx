import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ClientForm, { ClientFormValues } from "@/components/ClientForm";
import { Client, useClients } from "@/hooks/useClients";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Trash2, FolderOpen, PlusCircle, X } from "lucide-react"; // Adicionado X para o botão de cancelar edição
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EquipmentForm from "@/components/EquipmentForm";

const ClientDetailsView: React.FC<{ client: Client }> = ({ client }) => {
    const hasGoogleDriveLink = client.google_drive_link && client.google_drive_link.trim() !== '';

    const getMapHref = (mapsLink: string) => {
      if (mapsLink.startsWith("http://") || mapsLink.startsWith("https://")) {
        return mapsLink;
      }
      if (/^-?\d+\.\d+,\s*-?\d+\.\d+/.test(mapsLink)) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsLink)}`;
      }
      return "#";
    };

    return (
        <Card>
            <CardContent className="space-y-4 text-sm p-4">
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
                  {client.maps_link && isLinkClickable(client.maps_link) ? (
                    <a 
                      href={getMapHref(client.maps_link)}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <MapPin className="h-4 w-4" />
                      Ver no Mapa
                    </a>
                  ) : (
                    <p className="text-muted-foreground">N/A</p>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground">Google Drive</p>
                  {hasGoogleDriveLink ? (
                    <a 
                      href={client.google_drive_link!} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Abrir Pasta
                    </a>
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
              </CardContent>
          </Card>
    );
};

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, isLoading, updateClient, deleteClient } = useClients(); 
  const [isEditing, setIsEditing] = useState(false);
  const [selectedView, setSelectedView] = useState<'details' | 'orders' | 'equipments'>("details");
  const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);

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
    contact: client.contact || "",
    email: client.email || "",
    store: client.store || "CALDAS DA RAINHA",
    maps_link: client.maps_link || "",
    locality: client.locality || "",
    google_drive_link: client.google_drive_link || "",
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {/* O nome do cliente será exibido dentro do ClientDetailsView ou no modo de edição */}
          </div>
          
          <div className="flex flex-shrink-0 space-x-2">
            {selectedView === 'equipments' && (
              <Button size="sm" onClick={() => setIsAddEquipmentModalOpen(true)} className="flex-shrink-0">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Equipamento
              </Button>
            )}

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

        {selectedView === 'details' && (
          <>
            {/* REMOVIDO: h2 com o nome do cliente */}
            
            {isEditing ? (
              <Card> {/* NOVO: Envolvendo o formulário em um Card */}
                <CardContent className="pt-6"> {/* Adicionado pt-6 para espaçamento interno */}
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
      </div>
      <ClientDetailsBottomNav
        selectedView={selectedView}
        onSelectView={setSelectedView}
      />

      <Dialog open={isAddEquipmentModalOpen} onOpenChange={setIsAddEquipmentModalOpen}>
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
    </Layout>
  );
};

export default ClientDetails;