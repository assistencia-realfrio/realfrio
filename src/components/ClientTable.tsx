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
import { useClients, Client } from "@/hooks/useClients";
import { Skeleton } from "@/components/ui/skeleton";

export type { Client }; // Exportando o tipo Client do hook

interface ClientTableProps {
    onEdit: (client: Client) => void;
    searchTerm: string;
}

const ClientTable: React.FC<ClientTableProps> = ({ onEdit, searchTerm }) => {
  const { clients, isLoading, deleteClient } = useClients(searchTerm);

  const handleDelete = async (id: string, name: string) => {
    try {
        await deleteClient.mutateAsync(id);
        showSuccess(`Cliente ${name} removido com sucesso.`);
    } catch (error) {
        console.error("Erro ao deletar cliente:", error);
        showError("Erro ao deletar cliente. Tente novamente.");
    }
  };

  const getStatusVariant = (status: Client['status']): "default" | "secondary" | "outline" => {
    return status === "Ativo" ? "default" : "outline";
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
    <div className="rounded-md border overflow-x-auto"> {/* Adicionado overflow-x-auto */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden sm:table-cell">Contato</TableHead>
            <TableHead className="hidden md:table-cell">OS Totais</TableHead>
            <TableHead className="hidden md:table-cell">OS Abertas</TableHead> {/* NOVA COLUNA */}
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length > 0 ? (
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell 
                    className="font-medium text-primary hover:underline cursor-pointer" 
                    onClick={() => onEdit(client)}
                >
                    {client.name}
                </TableCell>
                <TableCell className="hidden sm:table-cell">{client.contact}</TableCell>
                <TableCell className="hidden md:table-cell">{client.totalOrders}</TableCell>
                <TableCell className="hidden md:table-cell">{client.openOrders}</TableCell> {/* EXIBINDO OS ABERTAS */}
                <TableCell>
                  <Badge variant={getStatusVariant(client.status)}>{client.status}</Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground"> {/* colSpan ajustado para 5 */}
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