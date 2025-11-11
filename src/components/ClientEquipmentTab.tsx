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
import { useNavigate } from "react-router-dom";
import EquipmentForm from "./EquipmentForm"; // Importação adicionada

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

  const handleRowClick = (equipmentId: string) => {
    navigate(`/equipments/${equipmentId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Card className="shadow-none border-none">
      <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">EQUIPAMENTOS ASSOCIADOS</CardTitle>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              ADICIONAR EQUIPAMENTO
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>ADICIONAR NOVO EQUIPAMENTO</DialogTitle>
            </DialogHeader>
            <EquipmentForm 
              clientId={clientId} 
              onSubmit={handleNewEquipmentSuccess} 
              onCancel={() => setIsAddModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {equipments.length > 0 ? (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NOME</TableHead>
                  <TableHead>MARCA</TableHead>
                  <TableHead>MODELO</TableHead>
                  <TableHead className="hidden sm:table-cell">Nº SÉRIE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipments.map((equipment) => (
                  <TableRow 
                    key={equipment.id} 
                    onClick={() => handleRowClick(equipment.id)}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">{equipment.name.toUpperCase()}</TableCell>
                    <TableCell>{(equipment.brand || 'N/A').toUpperCase()}</TableCell>
                    <TableCell>{(equipment.model || 'N/A').toUpperCase()}</TableCell>
                    <TableCell className="hidden sm:table-cell">{(equipment.serial_number || 'N/A').toUpperCase()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm">
            NENHUM EQUIPAMENTO ASSOCIADO A ESTE CLIENTE.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientEquipmentTab;