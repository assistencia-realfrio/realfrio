import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/utils/toast";
import { useClients, Client } from "@/hooks/useClients"; // Usando useClients (o hook unificado)
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils"; // Importar cn para combinar classes

export type { Client }; // Exportando o tipo Client do hook

interface ClientTableProps {
    searchTerm: string;
    storeFilter: "ALL" | Client['store'] | null;
    onView: (client: Client) => void; // Renomeado de onEdit para onView
}

const getStoreBadgeColor = (store: Client['store'] | null) => {
  switch (store) {
    case "CALDAS DA RAINHA":
      return "bg-blue-500";
    case "PORTO DE MÓS":
      return "bg-red-500";
    default:
      return "bg-gray-400"; // Cor padrão para 'N/A' ou null
  }
};

const ClientTable: React.FC<ClientTableProps> = ({ searchTerm, storeFilter, onView }) => {
  const { clients, isLoading } = useClients(searchTerm, storeFilter); // deleteClient não é mais usado aqui

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
                onClick={() => onView(client)} // Adiciona o clique na linha
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