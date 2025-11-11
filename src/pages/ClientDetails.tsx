import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ClientForm, { ClientFormValues } from "@/components/ClientForm";
import { Client, useClients } from "@/hooks/useClients";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Trash2, FolderOpen } from "lucide-react"; // Adicionado FolderOpen
import ClientOrdersTab from "@/components/ClientOrdersTab";
import ClientEquipmentTab from "@/components/ClientEquipmentTab"; // Caminho corrigido
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

const ClientActions: React.FC<{ client: Client, onEdit: () => void, onDelete: () => void, isDeleting: boolean }> = ({ client, onEdit, onDelete, isDeleting }) => (
    <div className="flex justify-end space-x-2 mb-4">
        <Button variant="outline" size="icon" className="sm:hidden" onClick={onEdit} aria-label="Editar">
            <Edit className="h-4 w-4" />
        </Button>
        <Button variant="outline" className="hidden sm:flex" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            EDITAR
        </Button>
        
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <>
                    <Button 
                        variant="destructive" 
                        size="icon" 
                        className="sm:hidden"
                        disabled={isDeleting}
                        aria-label="Excluir"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="destructive" 
                        className="hidden sm:flex"
                        disabled={isDeleting}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        EXCLUIR
                    </Button>
                </>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>TEM CERTEZA ABSOLUTA?</AlertDialogTitle>
                    <AlertDialogDescription>
                        ESTA AÇÃO NÃO PODE SER DESFEITA. ISSO EXCLUIRÁ PERMANENTEMENTE O CLIENTE 
                        <span className="font-semibold"> {client.name.toUpperCase()}</span> E TODOS OS DADOS ASSOCIADOS.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>CANCELAR</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onDelete} 
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={isDeleting}
                    >
                        EXCLUIR
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
);

const isGoogleMapsLink = (mapsLink: string | null): boolean => {
  if (!mapsLink) return false;
  return mapsLink.includes("GOOGLE.COM/MAPS") || /^-?\d+\.\d+,\s*-?\d+\.\d+/.test(mapsLink);
};

const ClientDetailsView: React.FC<{ client: Client }> = ({ client }) => {
    const hasGoogleDriveLink = client.google_drive_link && client.google_drive_link.trim() !== '';

    return (
        <div className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">NOME</p>
              <p className="font-medium">{client.name.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">LOJA</p>
              <p className="font-medium">{(client.store || 'N/A').toUpperCase()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">LOCALIDADE</p>
              <p className="font-medium">{(client.locality || 'N/A').toUpperCase()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">MAPS</p>
              {client.maps_link ? (
                isGoogleMapsLink(client.maps_link) ? (
                  <a 
                    href={client.maps_link.startsWith("HTTP") ? client.maps_link : `HTTPS://WWW.GOOGLE.COM/MAPS/SEARCH/?API=1&QUERY=${encodeURIComponent(client.maps_link)}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <MapPin className="h-4 w-4" />
                    VER NO MAPA
                  </a>
                ) : (
                  <p className="font-medium">{client.maps_link.toUpperCase()}</p>
                )
              ) : (
                <p className="text-muted-foreground">N/A</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">GOOGLE DRIVE</p>
              {hasGoogleDriveLink ? (
                <a 
                  href={client.google_drive_link!} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <FolderOpen className="h-4 w-4" />
                  ABRIR PASTA
                </a>
              ) : (
                <p className="text-muted-foreground">N/A</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">CONTATO</p>
              {client.contact ? (
                <a href={`TEL:${client.contact}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Phone className="h-4 w-4" />
                  {client.contact.toUpperCase()}
                </a>
              ) : (
                <p className="text-muted-foreground">N/A</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">E-MAIL</p>
              {client.email ? (
                <a href={`MAILTO:${client.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Mail className="h-4 w-4" />
                  {client.email.toUpperCase()}
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
  const [selectedView, setSelectedView] = useState<'details' | 'orders' | 'equipments' | 'history'>("details");

  const client = id ? clients.find(c => c.id === id) : undefined;

  const handleFormSubmit = async (data: ClientFormValues) => {
    if (!client?.id) return;
    try {
      await updateClient.mutateAsync({ id: client.id, ...data });
      showSuccess(`CLIENTE ${data.name} ATUALIZADO COM SUCESSO!`);
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      showError("ERRO AO ATUALIZAR CLIENTE. TENTE NOVAMENTE.");
    }
  };

  const handleDeleteClient = async () => {
    if (!client?.id || !client.name) return;
    try {
        await deleteClient.mutateAsync(client.id);
        showSuccess(`CLIENTE ${client.name} REMOVIDO COM SUCESSO.`);
        navigate('/clients', { replace: true });
    } catch (error) {
        console.error("Erro ao deletar cliente:", error);
        showError("ERRO AO DELETAR CLIENTE. TENTE NOVAMENTE.");
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
          <h2 className="text-2xl font-bold">CLIENTE NÃO ENCONTRADO</h2>
          <p className="text-muted-foreground">O CLIENTE COM ID {id} NÃO EXISTE OU VOCÊ NÃO TEM PERMISSÃO PARA VÊ-LO.</p>
          <Button onClick={() => navigate('/clients')} className="mt-4">VOLTAR PARA CLIENTES</Button>
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
    google_drive_link: client.google_drive_link || "", // NOVO: Adicionando google_drive_link
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between gap-2"> {/* Adicionado gap-2 */}
          <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0"> {/* Adicionado flex-1, min-w-0, sm:gap-4 */}
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{client.name.toUpperCase()}</h2> {/* Adicionado sm:text-3xl, truncate */}
          </div>
        </div>

        {selectedView === 'details' && (
          <>
            {!isEditing && (
              <ClientActions 
                client={client} 
                onEdit={() => setIsEditing(true)} 
                onDelete={handleDeleteClient}
                isDeleting={deleteClient.isPending}
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
    </Layout>
  );
};

export default ClientDetails;