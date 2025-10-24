import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ServiceOrderForm from "@/components/ServiceOrderForm";
import ActivityLog from "@/components/ActivityLog";
import TimeEntryComponent from "@/components/TimeEntry";
import Attachments from "@/components/Attachments"; // Importando o novo componente
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  store: "CALDAS DA RAINHA" | "PORTO DE MÓS"; // Novo campo
  date: string;
}

// Lista completa de Ordens de Serviço mock
const mockOrders: ServiceOrder[] = [
  { id: "OS-001", title: "Reparo de Ar Condicionado", client: "Empresa Alpha Soluções", description: "Troca de compressor e recarga de gás.", status: "Em Progresso", priority: "Alta", store: "CALDAS DA RAINHA", date: "2024-10-27" },
  { id: "OS-002", title: "Instalação de Rede", client: "Cliente Beta Individual", description: "Instalação de 5 pontos de rede CAT6.", status: "Pendente", priority: "Média", store: "PORTO DE MÓS", date: "2024-10-28" },
  { id: "OS-003", title: "Manutenção Preventiva", client: "Empresa Alpha Soluções", description: "Verificação de rotina em todos os equipamentos.", status: "Concluída", priority: "Baixa", store: "CALDAS DA RAINHA", date: "2024-10-26" },
  { id: "OS-004", title: "Substituição de Peça", client: "Loja Delta Varejo", description: "Substituição de peça defeituosa no sistema de ventilação.", status: "Pendente", priority: "Alta", store: "PORTO DE MÓS", date: "2024-10-29" },
  { id: "OS-005", title: "Configuração de Servidor", client: "Empresa Alpha Soluções", description: "Configuração inicial de novo servidor de arquivos.", status: "Em Progresso", priority: "Média", store: "CALDAS DA RAINHA", date: "2024-10-30" },
  { id: "OS-006", title: "Revisão Geral", client: "Cliente Beta Individual", description: "Revisão completa do sistema elétrico.", status: "Pendente", priority: "Baixa", store: "PORTO DE MÓS", date: "2024-11-01" },
  { id: "OS-007", title: "OS Cancelada", client: "Indústria Gama Pesada", description: "Serviço cancelado pelo cliente antes do início.", status: "Cancelada", priority: "Baixa", store: "CALDAS DA RAINHA", date: "2024-11-02" },
  { id: "OS-008", title: "Reparo Urgente de Eletricidade", client: "Empresa Alpha Soluções", description: "Curto-circuito na sala de servidores. Prioridade máxima.", status: "Pendente", priority: "Alta", store: "CALDAS DA RAINHA", date: "2024-11-03" },
  { id: "OS-009", title: "Instalação de Software", client: "Cliente Beta Individual", description: "Instalação e configuração de software de gestão.", status: "Concluída", priority: "Média", store: "PORTO DE MÓS", date: "2024-11-04" },
  { id: "OS-010", title: "Limpeza de Equipamento", client: "Loja Delta Varejo", description: "Limpeza profunda de equipamentos de refrigeração.", status: "Concluída", priority: "Baixa", store: "CALDAS DA RAINHA", date: "2024-11-05" },
];


// Mock function to simulate fetching/saving data
const fetchOrderById = (id: string): ServiceOrder | undefined => {
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
    store: order.store, // Incluindo a loja
  } : undefined;

  const handleSubmit = (data: any) => {
    console.log("Dados da OS submetidos:", data);
    // Aqui você faria a chamada API para salvar/atualizar
    navigate("/orders");
  };

  const title = isNew ? "Criar Nova Ordem de Serviço" : `Detalhes da OS: ${id}`;

  if (!isNew && !order) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">OS não encontrada</h2>
          <p className="text-muted-foreground">A Ordem de Serviço com ID {id} não existe.</p>
          <Button onClick={() => navigate("/orders")} className="mt-4">Voltar para a lista</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="activity">Atividades</TabsTrigger>
            <TabsTrigger value="time">Tempo</TabsTrigger>
            <TabsTrigger value="attachments">Anexos</TabsTrigger>
          </TabsList>
          
          {/* Aba de Detalhes/Edição */}
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{isNew ? "Preencha os detalhes da nova OS" : "Editar Ordem de Serviço"}</CardTitle>
              </CardHeader>
              <CardContent>
                <ServiceOrderForm initialData={initialData} onSubmit={handleSubmit} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Atividades */}
          <TabsContent value="activity" className="mt-6">
            {isNew ? (
              <p className="text-center text-muted-foreground py-8">Salve a OS para registrar atividades.</p>
            ) : (
              <ActivityLog orderId={id!} />
            )}
          </TabsContent>

          {/* Aba de Tempo */}
          <TabsContent value="time" className="mt-6">
            {isNew ? (
              <p className="text-center text-muted-foreground py-8">Salve a OS para registrar tempo.</p>
            ) : (
              <TimeEntryComponent orderId={id!} />
            )}
          </TabsContent>

          {/* Aba de Anexos */}
          <TabsContent value="attachments" className="mt-6">
            {isNew ? (
              <p className="text-center text-muted-foreground py-8">Salve a OS para adicionar anexos.</p>
            ) : (
              <Attachments orderId={id!} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ServiceOrderDetails;