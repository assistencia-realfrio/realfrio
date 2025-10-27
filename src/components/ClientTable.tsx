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
    onEdit: (client: Client) => void;
    searchTerm: string;
    storeFilter: "ALL" | Client['store'] | null; // Adicionando a prop storeFilter
}

const getStoreBadgeColor = (store: Client['store'] | null) => {
  switch (store) {
    case "CALDAS DA RAINHA":
      return "bg-blue-500 hover:bg-blue-600 text-white";
    case "PORTO DE MÓS":
      return "bg-red-500 hover:bg-red-600 text-white";
    default:
      return "bg-gray-200 hover:bg-gray-300 text-gray-800";
  }
};

const ClientTable: React.FC<ClientTableProps> = ({ onEdit, searchTerm, storeFilter }) => {
  const { clients, isLoading, deleteClient } = useClients(searchTerm, storeFilter); // Passando o storeFilter para o hook

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
    <div className="rounded-md border overflow-x-auto"> {/* Adicionado overflow-x-auto */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden sm:table-cell">Contato</TableHead>
            <TableHead className="hidden md:table-cell">OS Totais</TableHead>
            <TableHead className="hidden md:table-cell">OS Abertas</TableHead> {/* NOVA COLUNA */}
            <TableHead className="text-right">Ações</TableHead> {/* Adicionando coluna de Ações */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length > 0 ? (
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell 
                    className="font-medium text-foreground hover:underline cursor-pointer" // Alterado para text-foreground
                    onClick={() => onEdit(client)}
                >
                    <div className="flex items-center gap-2">
                        {client.name}
                        <Badge className={cn("text-xs px-2 py-0.5", getStoreBadgeColor(client.store))}>
                            {client.store || 'N/A'}
                        </Badge>
                    </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{client.contact}</TableCell>
                <TableCell className="hidden md:table-cell">{client.totalOrders}</TableCell>
                <TableCell className="hidden md:table-cell">{client.openOrders}</TableCell> {/* EXIBINDO OS ABERTAS */}
                <TableCell className="text-right"> {/* Célula para as ações */}
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