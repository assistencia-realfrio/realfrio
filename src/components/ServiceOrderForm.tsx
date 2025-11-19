import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // Mantido Input caso seja necessário em outro lugar
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
import EstablishmentSelector from "./EstablishmentSelector"; // Importar o novo seletor
import { useServiceOrders, ServiceOrderFormValues as MutationServiceOrderFormValues, serviceOrderStatuses } from "@/hooks/useServiceOrders";
import { useEquipments } from "@/hooks/useEquipments";
import { Skeleton } from "@/components/ui/skeleton";
import { User, MapPin, Phone, CalendarIcon, XCircle, HardDrive, Building } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useClients } from "@/hooks/useClients";
import { isLinkClickable } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, setHours, setMinutes, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useEstablishmentDetails } from "@/hooks/useEstablishmentDetails"; // NOVO: Importar hook de detalhes do estabelecimento

// Função para gerar intervalos de tempo de 30 minutos, das 08:00 às 18:00
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  // Começa às 8h (h=8) e vai até 18h (h=18)
  for (let h = 8; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      // Se for 18:30, não adiciona, pois o limite é 18:00
      if (h === 18 && m > 0) continue;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

const formSchema = z.object({
  client_id: z.string().uuid({ message: "Selecione um cliente válido." }),
  equipment_id: z.string().uuid({ message: "Selecione um equipamento válido." }),
  establishment_id: z.string().uuid().nullable().optional(),
  description: z.string().min(1, { message: "A descrição é obrigatória." }),
  status: z.enum(serviceOrderStatuses),
  store: z.enum(["CALDAS DA RAINHA", "PORTO DE MÓS"]),
  scheduled_date: z.date().nullable().optional(),
  // Este campo é apenas para uso no formulário (frontend)
  scheduled_time: z.string().nullable().optional(), 
});

export type ServiceOrderFormValues = z.infer<typeof formSchema>;

interface InitialData extends ServiceOrderFormValues {
    id?: string;
    establishment_name?: string | null;
}

interface ServiceOrderFormProps {
  initialData?: InitialData;
  onSubmit: (data: ServiceOrderFormValues & { id?: string }) => void;
  onCancel?: () => void;
}

// Função auxiliar para obter o link do mapa
const getMapHref = (mapsLink: string) => {
  if (mapsLink.startsWith("http://") || mapsLink.startsWith("https://")) {
    return mapsLink;
  }
  if (/^-?\d+\.\d+,\s*-?\d+\.\d+/.test(mapsLink)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsLink)}`;
  }
  return "#";
};


const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extrair a hora inicial se a data agendada existir
  const initialTime = initialData?.scheduled_date 
    ? format(new Date(initialData.scheduled_date), 'HH:mm') 
    : null;

  const form = useForm<ServiceOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
        ...initialData,
        scheduled_date: initialData.scheduled_date ? new Date(initialData.scheduled_date) : null,
        scheduled_time: initialTime, // Definir a hora inicial
    } : {
      client_id: searchParams.get('clientId') || "",
      equipment_id: "",
      establishment_id: null,
      description: "",
      status: "POR INICIAR",
      store: "CALDAS DA RAINHA",
      scheduled_date: null,
      scheduled_time: null, // Valor padrão para a hora
    },
  });

  const { createOrder, updateOrder } = useServiceOrders();
  const isEditing = !!initialData?.id;
  
  const clientId = form.watch("client_id");
  const equipmentId = form.watch("equipment_id");
  const establishmentId = form.watch("establishment_id"); // NOVO: Observar o ID do estabelecimento
  
  const [equipmentDetails, setEquipmentDetails] = useState({ name: '', brand: null, model: null, serial_number: null });
  const [establishmentName, setEstablishmentName] = useState<string | null>(initialData?.establishment_name || null);

  const { clients } = useClients();
  const selectedClient = clients.find(c => c.id === clientId);
  
  // NOVO: Buscar detalhes do estabelecimento selecionado
  const { data: establishmentDetails } = useEstablishmentDetails(establishmentId);

  const { singleEquipment } = useEquipments(undefined, initialData?.equipment_id);
  useEffect(() => {
    if (isEditing && singleEquipment) {
        setEquipmentDetails({
            name: singleEquipment.name,
            brand: singleEquipment.brand,
            model: singleEquipment.model,
            serial_number: singleEquipment.serial_number,
        });
    }
  }, [isEditing, singleEquipment]);


  const handleEquipmentChange = (equipmentId: string, details: any) => {
    form.setValue("equipment_id", equipmentId, { shouldValidate: true });
    setEquipmentDetails(details);
  };

  const handleEstablishmentChange = (id: string | null, name: string | null) => {
    form.setValue("establishment_id", id, { shouldValidate: true });
    setEstablishmentName(name);
  };

  const handleViewClientDetails = () => clientId && navigate(`/clients/${clientId}`);
  const handleViewEquipmentDetails = () => equipmentId && navigate(`/equipments/${equipmentId}`);
  
  const handleSubmit = async (data: ServiceOrderFormValues) => {
    // 1. Extrair scheduled_time e scheduled_date
    const { scheduled_time, scheduled_date, ...restOfData } = data;
    
    let scheduledDateWithTime: Date | null = scheduled_date || null;
    
    // 2. Se houver data, combiná-la com a hora (ou 00:00 se não houver hora)
    if (scheduledDateWithTime) {
        if (scheduled_time) {
            const [hours, minutes] = scheduled_time.split(':').map(Number);
            // Combine date and time
            scheduledDateWithTime = setMinutes(setHours(scheduledDateWithTime, hours), minutes);
        } else {
            // Se houver data, mas não hora, define para 00:00 (meia-noite)
            scheduledDateWithTime = setMinutes(setHours(scheduledDateWithTime, 0), 0);
        }
    }

    const mutationData = {
      ...restOfData, // Dados sem scheduled_time
      equipment: equipmentDetails.name,
      model: equipmentDetails.model,
      serial_number: equipmentDetails.serial_number,
      establishment_name: establishmentName,
      scheduled_date: scheduledDateWithTime, 
    } as MutationServiceOrderFormValues;

    try {
      if (isEditing && initialData.id) {
        await updateOrder.mutateAsync({ id: initialData.id, ...mutationData });
        showSuccess("Ordem de Serviço atualizada!");
      } else {
        const newOrder = await createOrder.mutateAsync(mutationData);
        showSuccess("Ordem de Serviço criada!");
        onSubmit({ ...data, id: newOrder.id });
        return;
      }
      onSubmit(data);
    } catch (error) {
      showError("Erro ao salvar Ordem de Serviço.");
    }
  };

  const clientHasMapLink = selectedClient?.maps_link && isLinkClickable(selectedClient.maps_link);
  const clientHasContact = selectedClient?.contact;
  
  // NOVO: Detalhes do estabelecimento
  const establishmentHasMapLink = establishmentDetails?.google_maps_link && isLinkClickable(establishmentDetails.google_maps_link);
  const establishmentHasPhone = establishmentDetails?.phone;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-1"> {/* Reduzido gap para 1 */}
                  <div className="flex-grow w-full min-w-0">
                    <ClientSelector value={field.value} onChange={field.onChange} disabled={isEditing} />
                  </div>
                  <div className="flex gap-1"> {/* Reduzido gap para 1 e removido flex-shrink-0 */}
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={handleViewClientDetails} 
                        disabled={!field.value}
                        aria-label="Detalhes do Cliente"
                    >
                        <User className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <a 
                        href={clientHasMapLink ? getMapHref(selectedClient!.maps_link!) : "#"}
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => !clientHasMapLink && e.preventDefault()}
                    >
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            disabled={!clientHasMapLink}
                            aria-label="Ver no Mapa do Cliente"
                        >
                            <MapPin className={cn("h-5 w-5", clientHasMapLink ? 'text-blue-600' : 'text-muted-foreground')} />
                        </Button>
                    </a>
                    <a 
                        href={clientHasContact ? `tel:${selectedClient!.contact!}` : "#"}
                        onClick={(e) => !clientHasContact && e.preventDefault()}
                    >
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            disabled={!clientHasContact}
                            aria-label="Ligar para o Cliente"
                        >
                            <Phone className={cn("h-5 w-5", clientHasContact ? 'text-green-600' : 'text-muted-foreground')} />
                        </Button>
                    </a>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estabelecimento Selector com Botões de Ação */}
          <FormField
            control={form.control}
            name="establishment_id"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-1"> {/* Reduzido gap para 1 */}
                  <div className="flex-grow w-full min-w-0">
                    <EstablishmentSelector clientId={clientId} value={field.value} onChange={handleEstablishmentChange} />
                  </div>
                  <div className="flex gap-1"> {/* Reduzido gap para 1 e removido flex-shrink-0 */}
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => clientId && navigate(`/clients/${clientId}?view=establishments`)} 
                        disabled={!clientId}
                        aria-label="Ver Estabelecimentos"
                    >
                        <Building className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <a 
                        href={establishmentHasMapLink ? getMapHref(establishmentDetails!.google_maps_link!) : "#"}
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => !establishmentHasMapLink && e.preventDefault()}
                    >
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            disabled={!establishmentHasMapLink}
                            aria-label="Ver no Mapa do Estabelecimento"
                        >
                            <MapPin className={cn("h-5 w-5", establishmentHasMapLink ? 'text-blue-600' : 'text-muted-foreground')} />
                        </Button>
                    </a>
                    <a 
                        href={establishmentHasPhone ? `tel:${establishmentDetails!.phone!}` : "#"}
                        onClick={(e) => !establishmentHasPhone && e.preventDefault()}
                    >
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            disabled={!establishmentHasPhone}
                            aria-label="Ligar para o Estabelecimento"
                        >
                            <Phone className={cn("h-5 w-5", establishmentHasPhone ? 'text-green-600' : 'text-muted-foreground')} />
                        </Button>
                    </a>
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
                <div className="flex items-center gap-1"> {/* Reduzido gap para 1 */}
                    <div className="flex-grow">
                        <EquipmentSelector clientId={clientId} value={field.value} onChange={handleEquipmentChange} disabled={isEditing} />
                    </div>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleViewEquipmentDetails} 
                        disabled={!equipmentId}
                        aria-label="Ver Detalhes do Equipamento"
                    >
                        <HardDrive className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    </Button>
                </div>
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
                  <Textarea placeholder="Detalhes do serviço..." {...field} rows={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Estado *" /></SelectTrigger></FormControl>
                  <SelectContent>{serviceOrderStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
                  <FormControl><SelectTrigger><SelectValue placeholder="Loja *" /></SelectTrigger></FormControl>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name="scheduled_date"
            render={({ field }) => (
              <FormItem className="flex flex-col col-span-2">
                <FormLabel>Data de Agendamento (Opcional)</FormLabel>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus locale={ptBR} />
                    </PopoverContent>
                  </Popover>
                  {field.value && (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => field.onChange(null)}
                        aria-label="Limpar Data"
                    >
                        <XCircle className="h-5 w-5 text-destructive" />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="scheduled_time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Hora (Opcional)</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value === "NONE_SELECTED" ? null : value)} 
                  value={field.value || "NONE_SELECTED"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a hora" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NONE_SELECTED">Nenhuma Hora</SelectItem>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={createOrder.isPending || updateOrder.isPending} className="w-full sm:w-auto">Cancelar</Button>}
          <Button type="submit" disabled={createOrder.isPending || updateOrder.isPending} className="w-full sm:w-auto">{isEditing ? "Salvar Alterações" : "Criar Ordem de Serviço"}</Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceOrderForm;