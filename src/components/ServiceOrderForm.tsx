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
import TechnicianSelector from "./TechnicianSelector"; // NOVO: Importar TechnicianSelector
import { useServiceOrders, ServiceOrderFormValues as MutationServiceOrderFormValues, serviceOrderStatuses } from "@/hooks/useServiceOrders";
import { useEquipments } from "@/hooks/useEquipments";
import { Skeleton } from "@/components/ui/skeleton";
import { User, MapPin, Phone, CalendarIcon, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClients } from "@/hooks/useClients";
import { isLinkClickable } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Definição do Schema de Validação
const formSchema = z.object({
  equipment_id: z.string().uuid({ message: "Selecione um equipamento válido." }),
  client_id: z.string().uuid({ message: "Selecione um cliente válido." }),
  description: z.string().min(1, { message: "A descrição é obrigatória." }),
  status: z.enum(serviceOrderStatuses),
  store: z.enum(["CALDAS DA RAINHA", "PORTO DE MÓS"]),
  scheduled_date: z.date().nullable().optional(),
  technician_id: z.string().uuid().nullable().optional(), // NOVO: ID do técnico, opcional
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

const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const navigate = useNavigate();
  const form = useForm<ServiceOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
        ...initialData,
        scheduled_date: initialData.scheduled_date ? new Date(initialData.scheduled_date) : null, // Converter string para Date
        technician_id: initialData.technician_id || null, // NOVO: Definir technician_id
    } : {
      equipment_id: "",
      client_id: "",
      description: "",
      status: "POR INICIAR",
      store: "CALDAS DA RAINHA",
      scheduled_date: null,
      technician_id: null, // Valor padrão
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
            scheduled_date: data.scheduled_date,
            technician_id: data.technician_id, // NOVO: Incluir technician_id
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
  const hasMapLink = selectedClient && selectedClient.maps_link && isLinkClickable(selectedClient.maps_link);
  const handleMapClick = () => {
    if (hasMapLink && selectedClient?.maps_link) {
      const mapHref = selectedClient.maps_link.startsWith("http") 
        ? selectedClient.maps_link 
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedClient.maps_link)}`;
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
                <FormLabel>Estado *</FormLabel>
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
                <FormLabel>Loja *</FormLabel>
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
        
        {/* NOVO: Seletor de Técnico */}
        <FormField
            control={form.control}
            name="technician_id"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Técnico Atribuído (Opcional)</FormLabel>
                    <FormControl>
                        <TechnicianSelector 
                            value={field.value} 
                            onChange={field.onChange} 
                            disabled={createOrder.isPending || updateOrder.isPending}
                        />
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
              <FormLabel>Cliente *</FormLabel>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex-grow w-full min-w-0">
                  <ClientSelector 
                    value={field.value} 
                    onChange={field.onChange} 
                    disabled={isEditing}
                  />
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={handleViewClientDetails}
                    disabled={!field.value}
                    aria-label="Ver detalhes do cliente"
                    className="flex-grow sm:flex-grow-0"
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
                    className="flex-grow sm:flex-grow-0"
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
                    className="flex-grow sm:flex-grow-0"
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

        {/* Campo de Data de Agendamento */}
        <FormField
          control={form.control}
          name="scheduled_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Agendamento (Opcional)</FormLabel>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                {field.value && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={() => field.onChange(null)}
                    aria-label="Limpar Data"
                  >
                    <XCircle className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={createOrder.isPending || updateOrder.isPending} className="w-full sm:w-auto">
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={createOrder.isPending || updateOrder.isPending} className="w-full sm:w-auto">
            {isEditing ? "Salvar Alterações" : "Criar Ordem de Serviço"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceOrderForm;