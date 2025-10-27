import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showSuccess } from "@/utils/toast";

// Definição do Schema de Validação
const formSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  // Alterado para permitir null ou string vazia
  contact: z.string().nullable().optional(),
  // Alterado para permitir null ou string vazia, e validação de e-mail
  email: z.string().email({ message: "E-mail inválido." }).nullable().optional().or(z.literal('')),
  store: z.enum(["CALDAS DA RAINHA", "PORTO DE MÓS"], { message: "Selecione uma loja." }), // Campo 'store' obrigatório
  address: z.string().nullable().optional(), // NOVO: Campo para a morada
});

export type ClientFormValues = z.infer<typeof formSchema>;

interface ClientFormProps {
  initialData?: ClientFormValues;
  onSubmit: (data: ClientFormValues) => void;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      contact: "",
      email: "",
      store: "CALDAS DA RAINHA", // Valor padrão para novas criações
      address: "", // Valor padrão para a morada
    },
  });

  const handleSubmit = (data: ClientFormValues) => {
    onSubmit(data);
    showSuccess(`Cliente ${initialData ? 'atualizado' : 'criado'} com sucesso!`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Cliente/Empresa *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Empresa XYZ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo para a morada movido para cá */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Morada (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Rua Exemplo, 123, Cidade" 
                  {...field} 
                  value={field.value || ""} // Garante que o input receba uma string vazia em vez de null
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone/Contato (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(XX) XXXXX-XXXX" 
                  {...field} 
                  value={field.value || ""} // Garante que o input receba uma string vazia em vez de null
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="contato@exemplo.com" 
                  {...field} 
                  value={field.value || ""} // Garante que o input receba uma string vazia em vez de null
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo para a loja */}
        <FormField
          control={form.control}
          name="store"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loja *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CALDAS DA RAINHA">Caldas da Rainha</SelectItem>
                  <SelectItem value="PORTO DE MÓS">Porto de Mós</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {initialData ? "Salvar Alterações" : "Criar Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientForm;