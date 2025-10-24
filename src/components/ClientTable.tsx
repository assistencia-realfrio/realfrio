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
import { showSuccess } from "@/utils/toast";

export interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  totalOrders: number;
  status: "Ativo" | "Inativo";
}

interface ClientTableProps {
    onEdit: (client: Client) => void;
}

const mockClients: Client[] = [
  { id: "C-001", name: "Empresa Alpha Soluções", contact: "(11) 98765-4321", email: "alpha@exemplo.com", totalOrders: 12, status: "Ativo" },
  { id: "C-002", name: "Cliente Beta Individual", contact: "(21) 99887-6655", email: "beta@exemplo.com", totalOrders: 3, status: "Ativo" },
  { id: "C-003", name: "Indústria Gama Pesada", contact: "(31) 97766-5544", email: "gama@exemplo.com", totalOrders: 0, status: "Inativo" },
  { id: "C-004", name: "Loja Delta Varejo", contact: "(41) 96655-4433", email: "delta@exemplo.com", totalOrders: 7, status: "Ativo" },
];

const ClientTable: React.FC<ClientTableProps> = ({ onEdit }) => {
  const [clients, setClients] = React.useState(mockClients);

  const handleDelete = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    showSuccess(`Cliente ${id} removido com sucesso.`);
  };

  const getStatusVariant = (status: Client['status']): "default" | "secondary" | "outline" => {
    return status === "Ativo" ? "default" : "outline";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden sm:table-cell">Contato</TableHead>
            <TableHead className="hidden md:table-cell">OS Totais</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length > 0 ? (
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.id}</TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell className="hidden sm:table-cell">{client.contact}</TableCell>
                <TableCell className="hidden md:table-cell">{client.totalOrders}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(client.status)}>{client.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(client)} aria-label="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)} aria-label="Excluir">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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