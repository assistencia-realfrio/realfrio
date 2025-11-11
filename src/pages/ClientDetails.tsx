import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { showSuccess, showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, MapPin, Mail, Phone, Store, Calendar, Link as LinkIcon, Loader2, FileText, HardDrive, History } from "lucide-react";
import EquipmentList from "@/components/EquipmentList";
import ActivityFeed from "@/components/ActivityFeed";
import ClientForm from "@/components/ClientForm";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { Client } from "@/types";
import Layout from "@/components/Layout";
import ClientDetailsBottomNav from "@/components/ClientDetailsBottomNav"; // Importar navegação inferior
import ClientOrdersTab from "@/components/ClientOrdersTab"; // Importar a aba de ordens

type View = 'details' | 'orders' | 'equipments' | 'history';

const ClientDetails: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { user } = useSession();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedView, setSelectedView] = useState<View>('details'); // Estado para navegação inferior

  const fetchClient = async () => {
    if (!clientId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (error) throw error;
      setClient(data as Client); 
    } catch (error) {
      console.error("Erro ao buscar detalhes do cliente:", error);
      showError("Erro ao carregar detalhes do cliente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  const handleUpdate = (updatedClient: Client) => {
    setClient(updatedClient);
    setIsEditing(false);
    showSuccess("Cliente atualizado com sucesso!");
  };

  const handleGoBack = () => navigate("/clients");

  if (isLoading) {
    return (
      <Layout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton className="h-40 col-span-1" />
            <Skeleton className="h-40 col-span-2" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <div className="p-4 text-center text-muted-foreground">Cliente não encontrado.</div>
      </Layout>
    );
  }

  if (isEditing) {
    return (
      <Layout>
        <div className="p-4 max-w-4xl mx-auto">
          <Button variant="outline" onClick={() => setIsEditing(false)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <ClientForm initialData={client} onSuccess={handleUpdate} />
        </div>
      </Layout>
    );
  }

  // Componente de Visualização de Detalhes
  const ClientDetailsView = () => (
    <Card className="shadow-none border-none">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg">Informações Básicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm p-0">
        {/* Localidade */}
        <div className="flex items-center text-muted-foreground min-w-0">
          <MapPin className="h-4 w-4 mr-3 flex-shrink-0" />
          <p className="truncate min-w-0" title={client.locality || "N/A"}>Localidade: {client.locality || "N/A"}</p>
        </div>
        {/* Loja */}
        <div className="flex items-center text-muted-foreground min-w-0">
          <Store className="h-4 w-4 mr-3 flex-shrink-0" />
          <p className="truncate min-w-0" title={client.store || "N/A"}>Loja: {client.store || "N/A"}</p>
        </div>
        {/* Contato */}
        <div className="flex items-center text-muted-foreground min-w-0">
          <Phone className="h-4 w-4 mr-3 flex-shrink-0" />
          <p className="min-w-0 truncate">
            Contato: 
            {client.contact ? (
              <a 
                href={`tel:${client.contact}`} 
                className="text-primary hover:underline ml-1 font-medium"
              >
                {client.contact}
              </a>
            ) : (
              " N/A"
            )}
          </p>
        </div>
        {/* Email */}
        <div className="flex items-center text-muted-foreground min-w-0">
          <Mail className="h-4 w-4 mr-3 flex-shrink-0" />
          <p className="truncate min-w-0" title={client.email || "N/A"}>Email: {client.email || "N/A"}</p>
        </div>
        {/* Criado em */}
        <div className="flex items-center text-muted-foreground min-w-0">
          <Calendar className="h-4 w-4 mr-3 flex-shrink-0" />
          <p className="min-w-0 truncate">Criado em: {format(new Date(client.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
        </div>
        
        <Separator className="my-3" />

        {/* Google Maps Link */}
        {client.maps_link && (
          <a href={client.maps_link} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors min-w-0 truncate">
            <MapPin className="h-4 w-4 mr-3 flex-shrink-0" />
            <span className="truncate">Ver no Google Maps</span>
          </a>
        )}
        {/* Google Drive Link */}
        {client.google_drive_link && (
          <a href={client.google_drive_link} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors min-w-0 truncate">
            <LinkIcon className="h-4 w-4 mr-3 flex-shrink-0" />
            <span className="truncate">Acessar Google Drive</span>
          </a>
        )}
      </CardContent>
    </Card>
  );

  const renderContent = (view: View) => {
    switch (view) {
      case 'details':
        return <ClientDetailsView />;
      case 'orders':
        return <ClientOrdersTab clientId={clientId!} />;
      case 'equipments':
        return <EquipmentList clientId={clientId!} />;
      case 'history':
        return <ActivityFeed entityType="client" entityId={clientId!} />;
      default:
        return <ClientDetailsView />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20 lg:pb-8"> {/* Adicionado padding bottom para a navegação inferior */}
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center min-w-0 flex-1">
            <Button variant="ghost" size="icon" onClick={handleGoBack} className="flex-shrink-0 mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1"> 
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{client.name}</h2>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" /> Editar Cliente
            </Button>
          </div>
        </div>

        <Separator />

        {/* Desktop Tabs / Mobile Content */}
        <div className="lg:hidden">
          {/* Mobile: Renderiza apenas o conteúdo da view selecionada */}
          {renderContent(selectedView)}
        </div>

        <div className="hidden lg:grid grid-cols-3 gap-6">
          {/* Desktop: Coluna de Detalhes Fixa */}
          <div className="lg:col-span-1 h-fit">
            <Card>
              <CardContent className="pt-6">
                <ClientDetailsView />
              </CardContent>
            </Card>
          </div>

          {/* Desktop: Tabs para Ordens, Equipamentos e Atividade */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="orders">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="orders">
                  <FileText className="h-4 w-4 mr-2" /> Ordens
                </TabsTrigger>
                <TabsTrigger value="equipments">
                  <HardDrive className="h-4 w-4 mr-2" /> Equipamentos
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-2" /> Histórico
                </TabsTrigger>
              </TabsList>
              <TabsContent value="orders" className="mt-4">
                <ClientOrdersTab clientId={clientId!} />
              </TabsContent>
              <TabsContent value="equipments" className="mt-4">
                <EquipmentList clientId={clientId!} />
              </TabsContent>
              <TabsContent value="history" className="mt-4">
                <ActivityFeed entityType="client" entityId={clientId!} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Navegação Inferior (Apenas em Mobile) */}
      <div className="lg:hidden">
        <ClientDetailsBottomNav
          selectedView={selectedView}
          onSelectView={setSelectedView}
        />
      </div>
    </Layout>
  );
};

export default ClientDetails;