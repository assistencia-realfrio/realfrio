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

export type { Client }; // Exportando o tipo Client do hook

interface ClientTableProps {
    onEdit: (client: Client) => void;
    searchTerm: string;
    storeFilter: "ALL" | Client['store'] | null; // Adicionando a prop storeFilter
}

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
            <TableHead className="hidden md:table-cell">Loja</TableHead> {/* NOVA COLUNA */}
            <TableHead>Status</TableHead>
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
                    {client.name}
                </TableCell>
                <TableCell className="hidden sm:table-cell">{client.contact}</TableCell>
                <TableCell className="hidden md:table-cell">{client.totalOrders}</TableCell>
                <TableCell className="hidden md:table-cell">{client.openOrders}</TableCell> {/* EXIBINDO OS ABERTAS */}
                <TableCell className="hidden md:table-cell">{client.store || 'N/A'}</TableCell> {/* EXIBINDO A LOJA */}
                <TableCell>
                  <Badge variant={getStatusVariant(client.status)} className="text-foreground">{client.status}</Badge> {/* Adicionado text-foreground */}
                </TableCell>
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
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground"> {/* colSpan ajustado para 7 */}
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