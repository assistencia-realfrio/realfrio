import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form"; // Importar FormProvider
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"; // Importar Separator
import { showSuccess, showError } from "@/utils/toast";
import { useServiceOrders, ServiceOrderFormValues as MutationServiceOrderFormValues, serviceOrderStatuses } from "@/hooks/useServiceOrders";
import { useEquipments } from "@/hooks/useEquipments";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useClients } from "@/hooks/useClients";
import { format, setHours, setMinutes } from "date-fns";

// Importar os novos componentes de cartão
import ServiceOrderClientAndEstablishmentCard from "./ServiceOrderClientAndEstablishmentCard";
import ServiceOrderEquipmentCard from "./ServiceOrderEquipmentCard";
import ServiceOrderStatusAndStoreCard from "./ServiceOrderStatusAndStoreCard";
import ServiceOrderDescriptionCard from "./ServiceOrderDescriptionCard";
import ServiceOrderScheduleCard from "./ServiceOrderScheduleCard";

// Função para gerar intervalos de tempo de 30 minutos, das 08:00 às 18:00
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let h = 8; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
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
  scheduled_time: z.string().nullable().optional(), 
});

export type ServiceOrderFormValues = z.infer<typeof formSchema>;

interface InitialData extends ServiceOrderFormValues {
    id?: string;
    equipment?: string; // Adicionado para o initialData
    model?: string | null; // Adicionado para o initialData
    serial_number?: string | null; // Adicionado para o initialData
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

  const methods = useForm<ServiceOrderFormValues>({
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
      store: "CALDAS DA RAINHA",
      scheduled_date: null,
      scheduled_time: null,
    },
  });

  const { createOrder, updateOrder } = useServiceOrders();
  const isEditing = !!initialData?.id;
  
  const clientId = methods.watch("client_id");
  const equipmentId = methods.watch("equipment_id");
  const establishmentId = methods.watch("establishment_id");
  
  const [equipmentDetails, setEquipmentDetails] = useState({ 
    name: initialData?.equipment || '', 
    brand: null, 
    model: initialData?.model || null, 
    serial_number: initialData?.serial_number || null 
  });
  const [establishmentName, setEstablishmentName] = useState<string | null>(initialData?.establishment_name || null);

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
    methods.setValue("equipment_id", equipmentId, { shouldValidate: true });
    setEquipmentDetails(details);
  };

  const handleEstablishmentChange = (id: string | null, name: string | null) => {
    methods.setValue("establishment_id", id, { shouldValidate: true });
    setEstablishmentName(name);
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

    const mutationData = {
      ...restOfData,
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

  const isPending = createOrder.isPending || updateOrder.isPending;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
        <ServiceOrderClientAndEstablishmentCard 
          isEditing={isEditing} 
          onEstablishmentChange={handleEstablishmentChange} 
        />
        <Separator />
        <ServiceOrderEquipmentCard 
          isEditing={isEditing} 
          onEquipmentChange={handleEquipmentChange} 
          clientId={clientId} 
        />
        <Separator />
        <ServiceOrderStatusAndStoreCard />
        <Separator />
        <ServiceOrderDescriptionCard />
        <Separator />
        <ServiceOrderScheduleCard />
        
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isPending} className="w-full sm:w-auto">Cancelar</Button>}
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">{isEditing ? "Salvar Alterações" : "Criar Ordem de Serviço"}</Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ServiceOrderForm;