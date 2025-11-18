import React from "react";
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
  const { equipments, isLoading } = useEquipments(clientId);

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
      {/* Removido o div que continha o título e o botão de adicionar equipamento */}
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