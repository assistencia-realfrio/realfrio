import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { showSuccess, showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, MapPin, Mail, Phone, Store, Calendar, Link as LinkIcon, Loader2 } from "lucide-react";
import EquipmentList from "@/components/EquipmentList";
import ActivityFeed from "@/components/ActivityFeed";
import ClientForm from "@/components/ClientForm";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { Client } from "@/types"; // Importando Client do types
import Layout from "@/components/Layout"; // Importar Layout

const ClientDetails: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { user } = useSession();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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

  if (isLoading) {
    return (
      <Layout> {/* Envolvido em Layout */}
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
      <Layout> {/* Envolvido em Layout */}
        <div className="p-4 text-center text-muted-foreground">Cliente não encontrado.</div>
      </Layout>
    );
  }

  if (isEditing) {
    return (
      <Layout> {/* Envolvido em Layout */}
        <div className="p-4 max-w-4xl mx-auto">
          <Button variant="outline" onClick={() => setIsEditing(false)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <ClientForm initialData={client} onSuccess={handleUpdate} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout> {/* Envolvido em Layout */}
      <div className="p-4 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center min-w-0 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate("/clients")} className="flex-shrink-0 mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {/* Ajuste aqui: Usando flex-1 e min-w-0 no container do título para garantir que o truncate funcione */}
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

        {/* Client Info and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Details Card (Col 1) */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-3 flex-shrink-0" />
                <p className="truncate" title={client.locality || "N/A"}>Localidade: {client.locality || "N/A"}</p>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Store className="h-4 w-4 mr-3 flex-shrink-0" />
                <p className="truncate" title={client.store || "N/A"}>Loja: {client.store || "N/A"}</p>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Phone className="h-4 w-4 mr-3 flex-shrink-0" />
                <p>
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
              <div className="flex items-center text-muted-foreground">
                <Mail className="h-4 w-4 mr-3 flex-shrink-0" />
                <p className="truncate" title={client.email || "N/A"}>Email: {client.email || "N/A"}</p>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-3 flex-shrink-0" />
                <p>Criado em: {format(new Date(client.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
              
              <Separator className="my-3" />

              {client.maps_link && (
                <a href={client.maps_link} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                  <MapPin className="h-4 w-4 mr-3 flex-shrink-0" />
                  Ver no Google Maps
                </a>
              )}
              {client.google_drive_link && (
                <a href={client.google_drive_link} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                  <LinkIcon className="h-4 w-4 mr-3 flex-shrink-0" />
                  Acessar Google Drive
                </a>
              )}
            </CardContent>
          </Card>

          {/* Tabs Section (Col 2 & 3) */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="equipments">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="equipments">Equipamentos</TabsTrigger>
                <TabsTrigger value="activity">Atividade</TabsTrigger>
              </TabsList>
              <TabsContent value="equipments" className="mt-4">
                <EquipmentList clientId={clientId!} /> {/* Adicionado ! para garantir que clientId existe */}
              </TabsContent>
              <TabsContent value="activity" className="mt-4">
                <ActivityFeed entityType="client" entityId={clientId!} /> {/* Adicionado ! para garantir que clientId existe */}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClientDetails;