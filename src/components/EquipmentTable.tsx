import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllEquipments } from "@/hooks/useAllEquipments";

interface EquipmentTableProps {
    searchTerm: string;
}

const EquipmentTable: React.FC<EquipmentTableProps> = ({ searchTerm }) => {
  const { equipments, isLoading } = useAllEquipments(searchTerm);
  const navigate = useNavigate();

  const handleRowClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
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
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="uppercase">Equipamento / Modelo</TableHead>
            <TableHead className="uppercase">Cliente</TableHead>
            <TableHead className="hidden sm:table-cell uppercase">Estabelecimento</TableHead>
            <TableHead className="hidden sm:table-cell uppercase">Marca</TableHead>
            <TableHead className="hidden md:table-cell uppercase">Nº Série</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipments.length > 0 ? (
            equipments.map((equipment) => (
              <TableRow 
                key={equipment.id} 
                onClick={() => handleRowClick(equipment.client_id)}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">
                  <div className="uppercase">{equipment.name}</div>
                  <div className="text-sm text-muted-foreground uppercase">{equipment.model || 'N/A'}</div>
                </TableCell>
                <TableCell className="uppercase">{equipment.client_name}</TableCell>
                <TableCell className="hidden sm:table-cell uppercase">{equipment.establishment_name || 'Sede / N/A'}</TableCell>
                <TableCell className="hidden sm:table-cell uppercase">{equipment.brand || 'N/A'}</TableCell>
                <TableCell className="hidden md:table-cell uppercase">{equipment.serial_number || 'N/A'}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground uppercase">
                Nenhum equipamento encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EquipmentTable;