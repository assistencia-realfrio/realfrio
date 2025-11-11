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
            <TableHead>EQUIPAMENTO / MODELO</TableHead>
            <TableHead>CLIENTE</TableHead>
            <TableHead className="hidden sm:table-cell">MARCA</TableHead>
            <TableHead className="hidden md:table-cell">Nº SÉRIE</TableHead>
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
                  <div>{equipment.name.toUpperCase()}</div>
                  <div className="text-sm text-muted-foreground">{(equipment.model || 'N/A').toUpperCase()}</div>
                </TableCell>
                <TableCell>{equipment.client_name.toUpperCase()}</TableCell>
                <TableCell className="hidden sm:table-cell">{(equipment.brand || 'N/A').toUpperCase()}</TableCell>
                <TableCell className="hidden md:table-cell">{(equipment.serial_number || 'N/A').toUpperCase()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                NENHUM EQUIPAMENTO ENCONTRADO.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EquipmentTable;