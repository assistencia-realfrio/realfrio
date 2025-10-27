import React from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceOrdersTabContent from "@/components/ServiceOrdersTabContent";
import ClientsTabContent from "@/components/ClientsTabContent";
import { Wrench, Users } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <Tabs defaultValue="service-orders">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px] mx-auto">
            <TabsTrigger value="service-orders">
              <Wrench className="h-4 w-4 mr-2" />
              Ordens de Serviço
            </TabsTrigger>
            <TabsTrigger value="clients">
              <Users className="h-4 w-4 mr-2" />
              Clientes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="service-orders" className="mt-6">
            <ServiceOrdersTabContent />
          </TabsContent>
          <TabsContent value="clients" className="mt-6">
            <ClientsTabContent />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Index;