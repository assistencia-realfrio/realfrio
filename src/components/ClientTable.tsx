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
import { Badge } from "@/components/ui/badge";
import { useClients, Client } from "@/hooks/useClients";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type { Client };

interface ClientTableProps {
    searchTerm: string;
    storeFilter: "ALL" | Client['store'] | null;
}

const getStoreBadgeColor = (store: Client['store'] | null) => {
  switch (store) {
    case "CALDAS DA RAINHA":
      return "bg-blue-500";
    case "PORTO DE MÓS":
    case "PORTO DE MÓS": // Duplicado, mantendo apenas um
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
};

const ClientTable: React.FC<ClientTableProps> = ({ searchTerm, storeFilter }) => {
  const { clients, isLoading } = useClients(searchTerm, storeFilter);
  const navigate = useNavigate();

  const handleRowClick = (clientId: string) => {
    navigate(`/clients/${clientId}`); // CORRIGIDO: Rota para /clients/:clientId
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
            <TableHead>Nome</TableHead>
            <TableHead className="hidden sm:table-cell">Contato</TableHead>
            <TableHead className="hidden sm:table-cell">Localidade</TableHead>
            <TableHead className="hidden md:table-cell">OS Totais</TableHead>
            <TableHead className="hidden md:table-cell">OS Abertas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length > 0 ? (
            clients.map((client) => (
              <TableRow 
                key={client.id} 
                onClick={() => handleRowClick(client.id)}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <TableCell 
                    className="font-medium text-foreground"
                >
                    <div className="flex items-center gap-2">
                        <Badge 
                            variant="default" 
                            className={cn("h-3 w-3 p-0 rounded-full", getStoreBadgeColor(client.store))}
                        />
                        {client.name}
                    </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{client.contact}</TableCell>
                <TableCell className="hidden sm:table-cell">{client.locality || 'N/A'}</TableCell>
                <TableCell className="hidden md:table-cell">{client.totalOrders}</TableCell>
                <TableCell className="hidden md:table-cell">{client.openOrders}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Nenhum cliente encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientTable;