import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import EquipmentSelector from "./EquipmentSelector"; // Novo import
import { useServiceOrders, ServiceOrderFormValues as MutationServiceOrderFormValues } from "@/hooks/useServiceOrders";

// Definição do Schema de Validação
const formSchema = z.object({
  // O equipamento agora é selecionado via ID
  equipment_id: z.string().uuid({ message: "Selecione um equipamento válido." }),
  client_id: z.string().uuid({ message: "Selecione um cliente válido." }),
  description: z.string().min(1, { message: "A descrição é obrigatória." }),
  status: z.enum(["Pendente", "Em Progresso", "Concluída", "Cancelada"]),
  store: z.enum(["CALDAS DA RAINHA", "PORTO DE MÓS"]),
});

// Tipo de dados para o formulário (agora inclui equipment_id)
export type ServiceOrderFormValues = z.infer<typeof formSchema>;

// Tipo de dados iniciais (pode incluir o ID da OS se for edição)
interface InitialData extends ServiceOrderFormValues {
    id?: string;
    // Adicionamos campos de equipamento para inicializar o seletor
    initialEquipmentId?: string;
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
      equipment_id: "",
      client_id: "",
      description: "",
      status: "Pendente",
      store: "CALDAS DA RAINHA",
    },
  });

  const { createOrder, updateOrder } = useServiceOrders();
  const isEditing = !!initialData?.id;
  
  // Observa o client_id para habilitar o EquipmentSelector
  const clientId = form.watch("client_id");
  
  // Estado para armazenar os detalhes do equipamento selecionado (nome, modelo, serial)
  // Estes detalhes serão usados na mutação para preencher os campos da OS
  const [equipmentDetails, setEquipmentDetails] = useState<{ name: string, model: string | null, serial_number: string | null } | null>(null);

  // Se estiver editando, precisamos carregar os detalhes iniciais do equipamento
  useEffect(() => {
    if (initialData?.initialEquipmentId) {
        // Em um cenário real, buscaríamos os detalhes do equipamento aqui.
        // Por enquanto, vamos assumir que o hook de OS já forneceu os detalhes necessários
        // e que o ServiceOrderDetails.tsx será atualizado para passar esses dados.
        // Como estamos refatorando, vamos simplificar: o ServiceOrderDetails.tsx
        // precisará ser atualizado para buscar o equipment_id.
        // Por enquanto, vamos focar na criação.
    }
  }, [initialData]);


  const handleEquipmentChange = (equipmentId: string, details: { name: string, model: string | null, serial_number: string | null }) => {
    form.setValue("equipment_id", equipmentId, { shouldValidate: true });
    setEquipmentDetails(details);
  };

  const handleSubmit = async (data: ServiceOrderFormValues) => {
    if (!equipmentDetails) {
        showError("Selecione um equipamento válido.");
        return;
    }

    try {
        // Mapeia os dados do formulário + detalhes do equipamento para a mutação
        const mutationData: MutationServiceOrderFormValues = {
            client_id: data.client_id,
            description: data.description,
            status: data.status,
            store: data.store,
            // Detalhes do equipamento vêm do estado
            equipment: equipmentDetails.name,
            model: equipmentDetails.model || undefined, 
            serial_number: equipmentDetails.serial_number || undefined,
        } as MutationServiceOrderFormValues; 

        if (isEditing && initialData.id) {
            await updateOrder.mutateAsync({ id: initialData.id, ...mutationData });
            showSuccess("Ordem de Serviço atualizada com sucesso!");
        } else {
            const newOrder = await createOrder.mutateAsync(mutationData);
            showSuccess("Ordem de Serviço criada com sucesso!");
            onSubmit({ ...data, id: newOrder.id });
            return;
        }
        onSubmit(data); // Para edição, apenas sinaliza que terminou
    } catch (error) {
        console.error("Erro ao salvar OS:", error);
        showError("Erro ao salvar Ordem de Serviço. Verifique os dados.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        
        {/* Cliente (Obrigatório) */}
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente *</FormLabel>
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

        {/* Equipamento (Obrigatório) */}
        <FormField
            control={form.control}
            name="equipment_id"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Equipamento *</FormLabel>
                    <FormControl>
                        <EquipmentSelector
                            clientId={clientId}
                            value={field.value}
                            onChange={handleEquipmentChange}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />

        {/* Descrição (Obrigatório) */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Serviço *</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalhes do serviço a ser executado..." {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estado (Obrigatório) */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado *</FormLabel>
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
        
          {/* Loja (Obrigatório) */}
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
        </div>

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