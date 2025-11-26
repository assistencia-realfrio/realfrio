import React from "react";
import Layout from "@/components/Layout";
import ClientForm, { ClientFormValues } from "@/components/ClientForm";
import { useClients } from "@/hooks/useClients";
import { showSuccess, showError } from "@/utils/toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NewClient: React.FC = () => {
  const navigate = useNavigate();
  const { createClient } = useClients();

  const handleNewClientSubmit = async (data: ClientFormValues) => {
    try {
      const newClient = await createClient.mutateAsync(data);
      showSuccess(`Cliente '${newClient.name}' criado com sucesso!`);
      navigate(`/clients/${newClient.id}`, { replace: true }); // Redireciona para os detalhes do novo cliente
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      showError("Erro ao criar novo cliente. Tente novamente.");
    }
  };

  const handleCancel = () => {
    navigate(-1); // Volta para a página anterior
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Criar Novo Cliente</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Novo Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientForm 
              onSubmit={handleNewClientSubmit} 
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewClient;