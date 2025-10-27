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
import { Edit, Trash2, MapPin } from "lucide-react"; // Importando MapPin
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/utils/toast";
import { useClientsList, Client } from "@/hooks/useClients"; // Usando useClientsList
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
import { Link, useNavigate } from "react-router-dom"; // Importando Link e useNavigate

export type { Client }; // Exportando o tipo Client do hook

interface ClientTableProps {
    searchTerm: string;
    storeFilter: "ALL" | Client['store'] | null; // Adicionando a prop storeFilter
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

// Função para verificar se a morada é um link do Google Maps
const isGoogleMapsLink = (address: string | null): boolean => {
  if (!address) return false;
  return address.includes("google.com/maps") || /^-?\d+\.\d+,\s*-?\d+\.\d+/.test(address);
};

const ClientTable: React.FC<ClientTableProps> = ({ searchTerm, storeFilter }) => {
  const { clients, isLoading, deleteClient } = useClientsList(searchTerm, storeFilter); // Usando useClientsList
  const navigate = useNavigate();

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
            <TableHead className="hidden lg:table-cell">Morada</TableHead> {/* NOVA COLUNA: Morada */}
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
                    <Link 
                        to={`/clients/${client.id}`} 
                        className="flex items-center gap-2 hover:underline cursor-pointer"
                    >
                        <Badge 
                            variant="default" 
                            className={cn("h-3 w-3 p-0 rounded-full", getStoreBadgeColor(client.store))}
                        />
                        {client.name}
                    </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{client.contact}</TableCell>
                <TableCell className="hidden lg:table-cell"> {/* Célula da Morada */}
                  {client.address ? (
                    isGoogleMapsLink(client.address) ? (
                      <a 
                        href={client.address.startsWith("http") ? client.address : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address)}`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()} // Impede que o clique na morada abra o modal de edição
                      >
                        <MapPin className="h-4 w-4" />
                        Ver no Mapa
                      </a>
                    ) : (
                      client.address
                    )
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">{client.totalOrders}</TableCell>
                <TableCell className="hidden md:table-cell">{client.openOrders}</TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${client.id}`)} aria-label="Editar">
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