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
    onEdit: (client: Client) => void; // Adicionando prop onEdit para abrir modal
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

const ClientTable: React.FC<ClientTableProps> = ({ searchTerm, storeFilter, onEdit }) => {
  const { clients, isLoading, deleteClient } = useClients(searchTerm, storeFilter); // Usando useClients

  const handleDelete = async (id: string, name: string) => {
    try {
        await deleteClient.mutateAsync(id);
        showSuccess(`Cliente ${name} removido com sucesso.`);
    } catch (error) {
        console.error("Erro ao deletar cliente:", error);
        showError("Erro ao deletar cliente. Tente novamente.");
    }
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
            <TableHead className="hidden sm:table-cell">Localidade</TableHead> {/* Alterado para Localidade */}
            <TableHead className="hidden md:table-cell">OS Totais</TableHead>
            <TableHead className="hidden md:table-cell">OS Abertas</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length > 0 ? (
            clients.map((client) => (
              <TableRow key={client.id}>
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
                <TableCell className="hidden sm:table-cell">{client.locality || 'N/A'}</TableCell> {/* Célula da Localidade */}
                <TableCell className="hidden md:table-cell">{client.totalOrders}</TableCell>
                <TableCell className="hidden md:table-cell">{client.openOrders}</TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(client)} aria-label="Editar">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    aria-label="Excluir"
                                    disabled={deleteClient.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente 
                                        <span className="font-semibold"> {client.name}</span> e todos os dados associados.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={() => handleDelete(client.id, client.name)} 
                                        className="bg-destructive hover:bg-destructive/90"
                                        disabled={deleteClient.isPending}
                                    >
                                        Excluir
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground"> {/* colSpan ajustado para 6 */}
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