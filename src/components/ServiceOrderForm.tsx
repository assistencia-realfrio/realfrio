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
import EquipmentSelector from "./EquipmentSelector";
import { useServiceOrders, ServiceOrderFormValues as MutationServiceOrderFormValues } from "@/hooks/useServiceOrders";
import { useEquipments } from "@/hooks/useEquipments";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react"; // Importando o ícone User
import ClientDetailsModal from "./ClientDetailsModal"; // Importando o novo modal

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
  // Observa o equipment_id do formulário para buscar os detalhes
  const currentEquipmentId = form.watch("equipment_id");

  // Usa o hook useEquipments para buscar os detalhes do equipamento único se estiver editando
  const { singleEquipment, isLoading: isLoadingSingleEquipment } = useEquipments(undefined, isEditing ? currentEquipmentId : undefined);

  // Estado para armazenar os detalhes do equipamento selecionado (nome, marca, modelo, serial)
  const [equipmentDetails, setEquipmentDetails] = useState<{ name: string, brand: string | null, model: string | null, serial_number: string | null }>({ name: '', brand: null, model: null, serial_number: null });

  // Estado para controlar o modal de detalhes do cliente
  const [isClientDetailsModalOpen, setIsClientDetailsModalOpen] = useState(false);

  // Efeito para inicializar equipmentDetails quando estiver editando e o singleEquipment for carregado
  useEffect(() => {
    if (isEditing && singleEquipment && !equipmentDetails.name) { // Verifica se equipmentDetails.name ainda não foi preenchido
      setEquipmentDetails({
        name: singleEquipment.name,
        brand: singleEquipment.brand,
        model: singleEquipment.model,
        serial_number: singleEquipment.serial_number,
      });
    }
  }, [isEditing, singleEquipment, equipmentDetails.name]);


  const handleEquipmentChange = (equipmentId: string, details: { name: string, brand: string | null, model: string | null, serial_number: string | null }) => {
    form.setValue("equipment_id", equipmentId, { shouldValidate: true });
    setEquipmentDetails(details);
  };

  const handleSubmit = async (data: ServiceOrderFormValues) => {
    if (!equipmentDetails.name) { // Verifica se o nome do equipamento está preenchido
        showError("Selecione um equipamento válido.");
        return;
    }

    try {
        // --- Lógica de Formatação Atualizada ---
        // Invertendo a ordem: NOME / MARCA
        const equipmentName = equipmentDetails.name;
        const equipmentBrand = equipmentDetails.brand;
        
        const formattedEquipment = equipmentBrand 
            ? `${equipmentName} / ${equipmentBrand}` 
            : equipmentName;
        // --------------------------------------

        // Mapeia os dados do formulário + detalhes do equipamento para a mutação
        const mutationData: MutationServiceOrderFormValues = {
            client_id: data.client_id,
            description: data.description,
            status: data.status,
            store: data.store,
            // Detalhes do equipamento vêm do estado
            equipment: formattedEquipment, // Usando o novo formato: NOME / MARCA
            model: equipmentDetails.model || undefined, 
            serial_number: equipmentDetails.serial_number || undefined,
            equipment_id: data.equipment_id, // Passando o ID do equipamento
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

  // Se estiver editando e ainda carregando os detalhes do equipamento, mostra um esqueleto de carregamento
  if (isEditing && isLoadingSingleEquipment) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

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
              <div className="flex items-center gap-2"> {/* Flex container para o seletor e o botão */}
                <div className="flex-grow">
                  <ClientSelector 
                    value={field.value} 
                    onChange={field.onChange} 
                    disabled={isEditing}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setIsClientDetailsModalOpen(true)} 
                  disabled={!field.value} // Desabilita se nenhum cliente estiver selecionado
                  aria-label="Ver detalhes do cliente"
                >
                  <User className="h-4 w-4" />
                </Button>
              </div>
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
                            disabled={isEditing}
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
                    <SelectTrigger> {/* Destaque removido */}
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
                    <SelectTrigger> {/* Destaque removido */}
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

        <div className="flex justify-center space-x-2 pt-4">
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

      {/* Modal de Detalhes do Cliente */}
      <ClientDetailsModal 
        clientId={clientId} 
        isOpen={isClientDetailsModalOpen} 
        onOpenChange={setIsClientDetailsModalOpen} 
      />
    </Form>
  );
};

export default ServiceOrderForm;