import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError } from "@/utils/toast";
import ClientEstablishmentUnifiedSelector from "./ClientEstablishmentUnifiedSelector"; // NOVO SELETOR
import EquipmentSelector from "./EquipmentSelector";
import { useServiceOrders, ServiceOrderMutationPayload, serviceOrderStatuses } from "@/hooks/useServiceOrders";
import { useEquipments } from "@/hooks/useEquipments"; // CORRIGIDO: Adicionado 'from'
import { Skeleton } from "@/components/ui/skeleton";
import { User, MapPin, Phone, CalendarIcon, XCircle, HardDrive, Tag, Box, Hash, Clock, Building } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useClients } from "@/hooks/useClients";
import { isLinkClickable } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, setHours, setMinutes, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Establishment, useClientEstablishments } from "@/hooks/useClientEstablishments";
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
  // ALTERADO: 'store' agora é um enum diretamente, tornando-o obrigatório
  store: z.enum(["CALDAS DA RAINHA", "PORTO DE MÓS"], {
    errorMap: () => ({ message: "Selecione uma loja." }),
  }),
  scheduled_date: z.date().nullable().optional(),
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

const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const initialTime = initialData?.scheduled_date 
    ? format(new Date(initialData.scheduled_date), 'HH:mm') 
    : null;

  const form = useForm<ServiceOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
        ...initialData,
        scheduled_date: initialData.scheduled_date ? new Date(initialData.scheduled_date) : null,
        scheduled_time: initialTime,
    } : {
      client_id: searchParams.get('clientId') || "",
      equipment_id: "",
      establishment_id: null,
      description: "",
      status: "POR INICIAR",
      store: undefined, // ALTERADO: Valor padrão undefined para novas OS
      scheduled_date: null,
      scheduled_time: null,
    },
  });

  const { createOrder, updateOrder } = useServiceOrders();
  const isEditing = !!initialData?.id;
  
  const clientId = form.watch("client_id");
  const equipmentId = form.watch("equipment_id");
  const establishmentId = form.watch("establishment_id");
  const scheduledDate = form.watch("scheduled_date");
  const scheduledTime = form.watch("scheduled_time");
  
  const [equipmentDetails, setEquipmentDetails] = useState({ name: '', brand: null, model: null, serial_number: null });
  const [establishmentName, setEstablishmentName] = useState<string | null>(initialData?.establishment_name || null);

  const { clients } = useClients();
  const selectedClient = clients.find(c => c.id === clientId);

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

  const { establishments } = useClientEstablishments(clientId);
  const selectedEstablishmentDetails = establishments.find(est => est.id === establishmentId);


  const handleEquipmentChange = (equipmentId: string, details: any) => {
    form.setValue("equipment_id", equipmentId, { shouldValidate: true });
    setEquipmentDetails(details);
  };

  // NOVO: Handler para o seletor unificado
  const handleClientEstablishmentChange = (result: { clientId: string, clientName: string, establishmentId: string | null, establishmentName: string | null }) => {
    // 1. Atualiza o cliente
    form.setValue("client_id", result.clientId, { shouldValidate: true });
    
    // 2. Atualiza o estabelecimento
    form.setValue("establishment_id", result.establishmentId, { shouldValidate: true });
    setEstablishmentName(result.establishmentName);
    
    // 3. Se o cliente mudou, resetamos o equipamento para forçar a re-seleção
    if (result.clientId !== clientId) {
        form.setValue("equipment_id", "", { shouldValidate: true });
        setEquipmentDetails({ name: '', brand: null, model: null, serial_number: null });
    }
  };

  const handleViewClientDetails = () => clientId && navigate(`/clients/${clientId}`);
  const handleViewEquipmentDetails = () => equipmentId && navigate(`/equipments/${equipmentId}`);
  
  const handleViewEstablishmentDetails = () => {
    if (clientId && establishmentId) {
      navigate(`/clients/${clientId}?tab=establishments`);
    }
  };

  const handleOpenEstablishmentMap = () => {
    if (selectedEstablishmentDetails?.google_maps_link && isLinkClickable(selectedEstablishmentDetails.google_maps_link)) {
        const href = getMapHref(selectedEstablishmentDetails.google_maps_link);
        window.open(href, '_blank');
    }
  };
  
  const handleCallEstablishmentPhone = () => {
    if (selectedEstablishmentDetails?.phone) {
        window.location.href = `tel:${selectedEstablishmentDetails.phone}`;
    }
  };

  const handleSubmit = async (data: ServiceOrderFormValues) => {
    const { scheduled_time, scheduled_date, ...restOfData } = data;
    
    let scheduledDateWithTime: Date | null = scheduled_date || null;
    
    if (scheduledDateWithTime) {
        if (scheduled_time) {
            const [hours, minutes] = scheduled_time.split(':').map(Number);
            scheduledDateWithTime = setMinutes(setHours(scheduledDateWithTime, hours), minutes);
        } else {
            scheduledDateWithTime = setMinutes(setHours(scheduledDateWithTime, 0), 0);
        }
    }

    const mutationData: ServiceOrderMutationPayload = {
      client_id: restOfData.client_id,
      description: restOfData.description,
      status: restOfData.status,
      store: restOfData.store,
      equipment: equipmentDetails.name,
      model: equipmentDetails.model,
      serial_number: equipmentDetails.serial_number,
      equipment_id: restOfData.equipment_id,
      establishment_id: restOfData.establishment_id,
      establishment_name: establishmentName,
      scheduled_date: scheduledDateWithTime ? scheduledDateWithTime.toISOString() : null, 
    };

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

  const hasClientMapLink = selectedClient?.maps_link && isLinkClickable(selectedClient.maps_link);
  const hasClientContact = selectedClient?.contact;

  const hasEstablishmentMapLink = selectedEstablishmentDetails?.google_maps_link && isLinkClickable(selectedEstablishmentDetails.google_maps_link);
  const hasEstablishmentPhone = selectedEstablishmentDetails?.phone;

  const getMapHref = (mapsLink: string) => {
    if (mapsLink.startsWith("http://") || mapsLink.startsWith("https://")) {
      return mapsLink;
    }
    if (/^-?\d+\.\d+,\s*-?\d+\.\d+/.test(mapsLink)) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsLink)}`;
    }
    return "#";
  };

  const handleOpenClientMap = () => {
    if (selectedClient?.maps_link && isLinkClickable(selectedClient.maps_link)) {
        const href = getMapHref(selectedClient.maps_link);
        window.open(href, '_blank');
    }
  };
  
  const handleCallClientContact = () => {
    if (selectedClient?.contact) {
        window.location.href = `tel:${selectedClient.contact}`;
    }
  };

  const handleCancelAppointment = async () => {
    if (!initialData?.id) {
      showError("Não é possível cancelar um agendamento de uma OS não salva.");
      return;
    }

    try {
      const currentFormValues = form.getValues();
      const { scheduled_time, scheduled_date, ...restOfFormValues } = currentFormValues; 

      const payload: ServiceOrderMutationPayload & { id: string } = {
        id: initialData.id,
        client_id: restOfFormValues.client_id,
        description: restOfFormValues.description,
        status: restOfFormValues.status,
        store: restOfFormValues.store,
        equipment: equipmentDetails.name,
        model: equipmentDetails.model,
        serial_number: equipmentDetails.serial_number,
        equipment_id: restOfFormValues.equipment_id,
        establishment_id: restOfFormValues.establishment_id,
        establishment_name: establishmentName,
        scheduled_date: null, // Explicitamente null para cancelamento
        updated_at: new Date().toISOString(),
      };

      await updateOrder.mutateAsync(payload);
      form.setValue("scheduled_date", null);
      form.setValue("scheduled_time", null);
      showSuccess("Agendamento cancelado com sucesso!");
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      showError("Erro ao cancelar agendamento. Tente novamente.");
    }
  };

  const hasAppointment = scheduledDate !== null || scheduledTime !== null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        
        {/* 1. Cliente e Localização (UNIFICADO) */}
        <Card>
          <CardHeader className="p-4 pb-0">
            {/* <CardTitle className="text-lg">Cliente e Localização</CardTitle> */}
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-2">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente / Estabelecimento *</FormLabel>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex-grow w-full min-w-0">
                      <ClientEstablishmentUnifiedSelector 
                        value={field.value} 
                        establishmentValue={establishmentId}
                        onChange={handleClientEstablishmentChange} 
                        disabled={isEditing} 
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-start sm:justify-end">
                      <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={handleViewClientDetails} 
                          disabled={!field.value}
                          className="flex-1 sm:flex-none"
                          aria-label="Detalhes do Cliente"
                      >
                          <User className="h-4 w-4" />
                      </Button>
                      <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={handleOpenClientMap}
                          disabled={!hasClientMapLink}
                          className="flex-1 sm:flex-none"
                          aria-label="Ver no Mapa"
                      >
                          <MapPin className={cn("h-4 w-4", hasClientMapLink ? 'text-blue-600' : '')} />
                      </Button>
                      <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={handleCallClientContact}
                          disabled={!hasClientContact}
                          className="flex-1 sm:flex-none"
                          aria-label="Ligar para o Cliente"
                      >
                          <Phone className={cn("h-4 w-4", hasClientContact ? 'text-green-600' : '')} />
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* NOVO: Exibição dos detalhes do Estabelecimento selecionado */}
            {establishmentId && selectedEstablishmentDetails && (
                <div className="space-y-2 pt-2 border-t mt-4">
                    <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <p className="font-semibold text-sm">Estabelecimento Selecionado: {selectedEstablishmentDetails.name}</p>
                    </div>
                    <div className="flex gap-2 w-full justify-start">
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={handleViewEstablishmentDetails} 
                            className="flex-1 sm:flex-none"
                        >
                            <Building className="h-4 w-4 mr-2" />
                            Ver Estabelecimento
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={handleOpenEstablishmentMap}
                            disabled={!hasEstablishmentMapLink}
                            className="flex-1 sm:flex-none"
                        >
                            <MapPin className={cn("h-4 w-4 mr-2", hasEstablishmentMapLink ? 'text-blue-600' : '')} />
                            Ver no Mapa
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={handleCallEstablishmentPhone}
                            disabled={!hasEstablishmentPhone}
                            className="flex-1 sm:flex-none"
                        >
                            <Phone className={cn("h-4 w-4 mr-2", hasEstablishmentPhone ? 'text-green-600' : '')} />
                            Ligar
                        </Button>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Equipamento */}
        <Card>
          <CardHeader className="p-4 pb-0">
            {/* <CardTitle className="text-lg">Equipamento</CardTitle> */}
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-2">
            <FormField
              control={form.control}
              name="equipment_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipamento *</FormLabel>
                  <div className="flex items-center gap-2">
                      <div className="flex-grow">
                          <EquipmentSelector clientId={clientId} value={field.value} onChange={handleEquipmentChange} disabled={isEditing} />
                      </div>
                      <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          onClick={handleViewEquipmentDetails} 
                          disabled={!equipmentId}
                          aria-label="Ver Detalhes do Equipamento"
                      >
                          <HardDrive className="h-4 w-4" />
                      </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Exibir detalhes do equipamento selecionado (apenas leitura) */}
            {equipmentId && (
                <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                            <p className="text-muted-foreground text-xs">Marca</p>
                            <p className="font-medium">{equipmentDetails.brand || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                            <p className="text-muted-foreground text-xs">Modelo</p>
                            <p className="font-medium">{equipmentDetails.model || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                            <p className="text-muted-foreground text-xs">Nº de Série</p>
                            <p className="font-medium">{equipmentDetails.serial_number || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Detalhes do Serviço */}
        <Card>
          <CardHeader className="p-4 pb-0">
            {/* <CardTitle className="text-lg">Detalhes do Serviço e Agendamento</CardTitle> */}
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-2">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value} // Garante que o Select é controlado
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a loja *" /> {/* Placeholder para indicar que é obrigatório */}
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
          </CardContent>
        </Card>

        {/* NOVO: Card de Agendamento */}
        <Card>
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Agendamento</CardTitle>
            {hasAppointment && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive"
                    disabled={updateOrder.isPending}
                    aria-label="Cancelar Agendamento"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza que deseja cancelar?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação removerá a data e hora agendadas para esta Ordem de Serviço.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Não</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleCancelAppointment} 
                      className="bg-destructive hover:bg-destructive/90"
                      disabled={updateOrder.isPending}
                    >
                      Sim, Cancelar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 p-4 pt-2">
            <FormField
              control={form.control}
              name="scheduled_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-between text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : ""}
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
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="scheduled_time"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Hora</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === "NONE_SELECTED" ? null : value)} 
                    value={field.value || "NONE_SELECTED"}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full justify-between text-left font-normal">
                        <SelectValue placeholder="Hora do Agendamento" />
                        <Clock className="ml-auto h-4 w-4 opacity-50" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NONE_SELECTED"></SelectItem>
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
          </CardContent>
        </Card>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={createOrder.isPending || updateOrder.isPending} className="w-full sm:w-auto">Cancelar</Button>}
          <Button type="submit" disabled={createOrder.isPending || updateOrder.isPending} className="w-full sm:w-auto">{isEditing ? "Salvar Alterações" : "Criar Ordem de Serviço"}</Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceOrderForm;