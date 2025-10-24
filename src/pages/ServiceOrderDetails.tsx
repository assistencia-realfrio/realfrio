import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ServiceOrderForm from "@/components/ServiceOrderForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data structure (needs to match ServiceOrderFormValues + id/date)
interface ServiceOrder {
  id: string;
  title: string;
  client: string;
  description: string;
  status: "Pendente" | "Em Progresso" | "Concluída" | "Cancelada";
  priority: "Alta" | "Média" | "Baixa";
  date: string;
}

// Mock function to simulate fetching/saving data
const fetchOrderById = (id: string): ServiceOrder | undefined => {
  // In a real app, this would be an API call
  const mockOrders: ServiceOrder[] = [
    { id: "OS-001", title: "Reparo de Ar Condicionado", client: "Empresa A", description: "Troca de compressor e recarga de gás.", status: "Em Progresso", priority: "Alta", date: "2024-10-27" },
    { id: "OS-002", title: "Instalação de Rede", client: "Cliente B", description: "Instalação de 5 pontos de rede CAT6.", status: "Pendente", priority: "Média", date: "2024-10-28" },
  ];
  return mockOrders.find(order => order.id === id);
};

const ServiceOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const isNew = id === 'new';
  const order = !isNew ? fetchOrderById(id!) : undefined;

  const initialData = order ? {
    title: order.title,
    client: order.client,
    description: order.description,
    priority: order.priority,
    status: order.status,
  } : undefined;

  const handleSubmit = (data: any) => {
    console.log("Dados da OS submetidos:", data);
    // Aqui você faria a chamada API para salvar/atualizar
    navigate("/orders");
  };

  const title = isNew ? "Criar Nova Ordem de Serviço" : `Detalhes da OS: ${id}`;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isNew ? "Preencha os detalhes da nova OS" : "Editar Ordem de Serviço"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ServiceOrderForm initialData={initialData} onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ServiceOrderDetails;