import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEquipments, Equipment } from "@/hooks/useEquipments";
import { Skeleton } from "@/components/ui/skeleton";
import EquipmentForm from "./EquipmentForm";
import { useNavigate } from "react-router-dom";
import EquipmentCard from "./EquipmentCard"; // Importar o novo componente EquipmentCard

interface ClientEquipmentTabProps {
  clientId: string;
}

const ClientEquipmentTab: React.FC<ClientEquipmentTabProps> = ({ clientId }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { equipments, isLoading } = useEquipments(clientId);
  const navigate = useNavigate();

  const handleNewEquipmentSuccess = () => {
    setIsAddModalOpen(false);
    // A query será invalidada automaticamente pelo hook useEquipments
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="shadow-none border-none">
      <div className="p-0 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Equipamentos Associados</CardTitle>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Equipamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Equipamento</DialogTitle>
            </DialogHeader>
            <EquipmentForm 
              clientId={clientId} 
              onSubmit={handleNewEquipmentSuccess} 
              onCancel={() => setIsAddModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="p-0">
        {equipments.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"> {/* Layout de grade para os cartões */}
            {equipments.map((equipment) => (
              <EquipmentCard key={equipment.id} equipment={equipment} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm">
            Nenhum equipamento associado a este cliente.
          </p>
        )}
      </div>
    </div>
  );
};

export default ClientEquipmentTab;