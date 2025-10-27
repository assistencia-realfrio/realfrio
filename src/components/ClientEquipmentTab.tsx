import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
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
import { showSuccess, showError } from "@/utils/toast";
import EquipmentForm from "./EquipmentForm"; // Importação corrigida para o componente EquipmentForm

interface ClientEquipmentTabProps {
  clientId: string;
}

const ClientEquipmentTab: React.FC<ClientEquipmentTabProps> = ({ clientId }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { equipments, isLoading } = useEquipments(clientId);

  const handleNewEquipmentSuccess = (newEquipment: Equipment) => {
    setIsAddModalOpen(false);
    // A query será invalidada automaticamente pelo hook useEquipments
  };

  const handleDelete = (equipmentId: string, equipmentName: string) => {
    // Implementar lógica de exclusão aqui
    showError(`Funcionalidade de exclusão para ${equipmentName} ainda não implementada.`);
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
            {/* Reutilizando o formulário de criação de equipamento */}
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead className="hidden sm:table-cell">Nº Série</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipments.map((equipment) => (
                  <TableRow key={equipment.id}>
                    <TableCell className="font-medium">{equipment.name}</TableCell>
                    <TableCell>{equipment.brand || 'N/A'}</TableCell>
                    <TableCell>{equipment.model || 'N/A'}</TableCell>
                    <TableCell className="hidden sm:table-cell">{equipment.serial_number || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" aria-label="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(equipment.id, equipment.name)} 
                          aria-label="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm">
            Nenhum equipamento associado a este cliente.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientEquipmentTab;