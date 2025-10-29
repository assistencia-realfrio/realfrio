import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ClientForm, { ClientFormValues } from "@/components/ClientForm";
import { Client, useClients } from "@/hooks/useClients";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Trash2, QrCode } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ClientDetailsBottomNav from "@/components/ClientDetailsBottomNav";
import ActivityLog from "@/components/ActivityLog";
import QRCodeGenerator from "@/components/QRCodeGenerator"; // Importar o novo componente

const ClientActions: React.FC<{ client: Client, onEdit: () => void, onDelete: () => void, isDeleting: boolean, onGenerateQrCode: () => void }> = ({ client, onEdit, onDelete, isDeleting, onGenerateQrCode }) => (
    <div className="flex justify-end space-x-2 mb-4">
        <Button variant="outline" size="sm" onClick={onGenerateQrCode}>
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
        </Button>
        <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
        </Button>
        
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    variant="destructive" 
                    size="sm" 
                    disabled={isDeleting}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
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
                        onClick={onDelete} 
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={isDeleting}
                    >
                        Excluir
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
);

const isGoogleMapsLink = (mapsLink: string | null): boolean => {
  if (!mapsLink) return false;
  return mapsLink.includes("google.com/maps") || /^-?\d+\.\d+,\s*-?\d+\.\d+/.test(mapsLink);
};

const ClientDetailsView: React.FC<{ client: Client }> = ({ client }) => {
    return (
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

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, isLoading, updateClient, deleteClient } = useClients(); 
  const [isEditing, setIsEditing] = useState(false);
  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false); // Estado para o modal do QR Code
  const [selectedView, setSelectedView] = useState<'details' | 'orders' | 'equipments' | 'history'>("details");

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
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
        </div>

        {selectedView === 'details' && (
          <>
            {!isEditing && (
              <ClientActions 
                client={client} 
                onEdit={() => setIsEditing(true)} 
                onDelete={handleDeleteClient}
                isDeleting={deleteClient.isPending}
                onGenerateQrCode={() => setIsQrCodeModalOpen(true)} // Abre o modal do QR Code
              />
            )}
            
            {isEditing ? (
              <ClientForm 
                initialData={initialFormData} 
                onSubmit={handleFormSubmit} 
                onCancel={() => setIsEditing(false)} 
              />
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

        {selectedView === 'history' && (
          <ActivityLog entityType="client" entityId={client.id} />
        )}
      </div>
      <ClientDetailsBottomNav
        selectedView={selectedView}
        onSelectView={setSelectedView}
      />

      {/* Modal para Gerar QR Code do Cliente */}
      <Dialog open={isQrCodeModalOpen} onOpenChange={setIsQrCodeModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>QR Code do Cliente</DialogTitle>
          </DialogHeader>
          <QRCodeGenerator 
            entityType="clients" 
            entityId={client.id} 
            entityName={client.name} 
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ClientDetails;