import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { showSuccess, showError } from "@/utils/toast";
import ClientSelector from "./ClientSelector";
import { useServiceOrders, ServiceOrderFormValues as MutationServiceOrderFormValues } from "@/hooks/useServiceOrders";

// Definição do Schema de Validação
const formSchema = z.object({
  title: z.string().min(5, { message: "O título deve ter pelo menos 5 caracteres." }),
  client_id: z.string().uuid({ message: "Selecione um cliente válido." }), // Agora usamos o ID do cliente
  description: z.string().min(1, { message: "A descrição é obrigatória." }),
  // Prioridade removida
  status: z.enum(["Pendente", "Em Progresso", "Concluída", "Cancelada"]),
  store: z.enum(["CALDAS DA RAINHA", "PORTO DE MÓS"]),
});

// Tipo de dados para o formulário (corresponde exatamente ao MutationServiceOrderFormValues)
export type ServiceOrderFormValues = z.infer<typeof formSchema>;

// Tipo de dados iniciais (pode incluir o ID da OS se for edição)
interface InitialData extends ServiceOrderFormValues {
    id?: string;
}

interface ServiceOrderFormProps {
  initialData?: InitialData;
  onSubmit: (data: ServiceOrderFormValues & { id?: string }) => void;
  onCancel?: () => void; // Tornando onCancel opcional
}

const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const form = useForm<ServiceOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      client_id: "", // Deve ser o ID do cliente
      description: "",
      // priority: "Média", // Removido
      status: "Pendente",
      store: "CALDAS DA RAINHA",
    },
  });

  const { createOrder, updateOrder } = useServiceOrders();
  const isEditing = !!initialData?.id;

  const handleSubmit = async (data: ServiceOrderFormValues) => {
    try {
        // Erro 2 corrigido: 'data' é garantido pelo Zod como ServiceOrderFormValues completo.
        // Usamos o cast para garantir que o TypeScript saiba que é o tipo de mutação esperado.
        const mutationData = data as MutationServiceOrderFormValues;

        if (isEditing && initialData.id) {
            await updateOrder.mutateAsync({ id: initialData.id, ...mutationData });
            showSuccess("Ordem de Serviço atualizada com sucesso!");
        } else {
            const newOrder = await createOrder.mutateAsync(mutationData);
            showSuccess("Ordem de Serviço criada com sucesso!");
            // Passa o ID da nova OS para o componente pai, se necessário
            onSubmit({ ...data, id: newOrder.id });
            return;
        }
        onSubmit(data); // Para edição, apenas sinaliza que terminou
    } catch (error) {
        console.error("Erro ao salvar OS:", error);
        showError("Erro ao salvar Ordem de Serviço. Tente novamente.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da OS</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Reparo de Ar Condicionado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <FormControl>
                <ClientSelector 
                  value={field.value} 
                  onChange={field.onChange} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Serviço</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalhes do serviço a ser executado..." {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campo de Prioridade removido */}

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Progresso">Em Progresso</SelectItem>
                    <SelectItem value="Concluída">Concluída</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="store"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loja</FormLabel>
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
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={createOrder.isPending || updateOrder.isPending}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={createOrder.isPending || updateOrder.isPending}>
            {isEditing ? "Salvar Alterações" : "Criar Ordem de Serviço"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceOrderForm;