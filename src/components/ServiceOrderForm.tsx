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
import { useServiceOrders, ServiceOrderFormValues as MutationServiceOrderFormValues, serviceOrderStatuses } from "@/hooks/useServiceOrders";
import { useEquipments } from "@/hooks/useEquipments";
import { Skeleton } from "@/components/ui/skeleton";
import { User, MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClients } from "@/hooks/useClients";

// Definição do Schema de Validação
const formSchema = z.object({
  equipment_id: z.string().uuid({ message: "Selecione um equipamento válido." }),
  client_id: z.string().uuid({ message: "Selecione um cliente válido." }),
  description: z.string().min(1, { message: "A descrição é obrigatória." }),
  status: z.enum(serviceOrderStatuses),
  store: z.enum(["CALDAS DA RAINHA", "PORTO DE MÓS"]),
});

export type ServiceOrderFormValues = z.infer<typeof formSchema>;

interface InitialData extends ServiceOrderFormValues {
    id?: string;
}

interface ServiceOrderFormProps {
  initialData?: InitialData;
  onSubmit: (data: ServiceOrderFormValues & { id?: string }) => void;
  onCancel?: () => void;
}

// Função auxiliar para verificar se o link é do Google Maps ou coordenadas
const isGoogleMapsLink = (mapsLink: string | null): boolean => {
  if (!mapsLink) return false;
  return mapsLink.includes("google.com/maps") || /^-?\d+\.\d+,\s*-?\d+\.\d+/.test(mapsLink);
};

const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const navigate = useNavigate();
  const form = useForm<ServiceOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
        ...initialData,
    } : {
      equipment_id: "",
      client_id: "",
      description: "",
      status: "POR INICIAR",
      store: "CALDAS DA RAINHA",
    },
  });

  const { createOrder, updateOrder } = useServiceOrders();
  const isEditing = !!initialData?.id;
  
  const clientId = form.watch("client_id");
  const currentEquipmentId = form.watch("equipment_id");

  const { clients } = useClients();
  const selectedClient = clients.find(c => c.id === clientId);

  const { singleEquipment, isLoading: isLoadingSingleEquipment } = useEquipments(undefined, isEditing ? currentEquipmentId : undefined);

  const [equipmentDetails, setEquipmentDetails] = useState<{ name: string, brand: string | null, model: string | null, serial_number: string | null }>({ name: '', brand: null, model: null, serial_number: null });

  useEffect(() => {
    if (isEditing && singleEquipment && !equipmentDetails.name) {
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

  const handleViewClientDetails = () => {
    if (clientId) {
      navigate(`/clients/${clientId}`);
    }
  };
  
  const handleSubmit = async (data: ServiceOrderFormValues) => {
    if (!equipmentDetails.name) {
        showError("Selecione um equipamento válido.");
        return;
    }
    
    try {
        const equipmentName = equipmentDetails.name;
        const equipmentBrand = equipmentDetails.brand;
        
        const formattedEquipment = equipmentBrand 
            ? `${equipmentName} / ${equipmentBrand}` 
            : equipmentName;

        const mutationData: MutationServiceOrderFormValues = {
            client_id: data.client_id,
            description: data.description,
            status: data.status,
            store: data.store,
            equipment: formattedEquipment,
            model: equipmentDetails.model || undefined, 
            serial_number: equipmentDetails.serial_number || undefined,
            equipment_id: data.equipment_id,
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
        onSubmit(data);
    } catch (error) {
        console.error("Erro ao salvar OS:", error);
        showError("Erro ao salvar Ordem de Serviço. Verifique os dados.");
    }
  };

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
  
  // Lógica para os botões de mapa e telefone
  const hasMapLink = selectedClient && selectedClient.maps_link && isGoogleMapsLink(selectedClient.maps_link);
  const handleMapClick = () => {
    if (hasMapLink) {
      const mapHref = selectedClient.maps_link.startsWith("http") ? selectedClient.maps_link : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedClient.maps_link)}`;
      window.open(mapHref, '_blank', 'noopener,noreferrer');
    }
  };

  const hasContact = selectedClient && selectedClient.contact;
  const handlePhoneClick = () => {
    if (hasContact) {
      window.location.href = `tel:${selectedClient.contact}`;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado *" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {serviceOrderStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        
          <FormField
            control={form.control}
            name="store"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Loja *" />
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

        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente *</FormLabel>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2"> {/* Alterado para empilhar em mobile */}
                <div className="flex-grow w-full"> {/* Garante que o seletor ocupe a largura total em mobile */}
                  <ClientSelector 
                    value={field.value} 
                    onChange={field.onChange} 
                    disabled={isEditing}
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start"> {/* Container para os botões */}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={handleViewClientDetails}
                    disabled={!field.value}
                    aria-label="Ver detalhes do cliente"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Ver no mapa"
                    disabled={!hasMapLink}
                    onClick={handleMapClick}
                  >
                    <MapPin className={`h-4 w-4 ${hasMapLink ? 'text-blue-600' : ''}`} />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Ligar para o cliente"
                    disabled={!hasContact}
                    onClick={handlePhoneClick}
                  >
                    <Phone className={`h-4 w-4 ${hasContact ? 'text-green-600' : ''}`} />
                  </Button>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

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
    </Form>
  );
};

export default ServiceOrderForm;