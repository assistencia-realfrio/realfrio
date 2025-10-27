import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, HardDrive } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { showSuccess, showError } from "@/utils/toast";
import { useEquipments, EquipmentFormValues, Equipment } from "@/hooks/useEquipments";
import { Skeleton } from "@/components/ui/skeleton";

// Schema de validação para o formulário de novo equipamento
const newEquipmentSchema = z.object({
  name: z.string().min(3, { message: "O nome do equipamento é obrigatório." }),
  model: z.string().optional().or(z.literal('')),
  serial_number: z.string().optional().or(z.literal('')),
});

type NewEquipmentFormValues = z.infer<typeof newEquipmentSchema>;

interface EquipmentSelectorProps {
  clientId: string;
  value: string; // Deve ser o ID do equipamento
  onChange: (equipmentId: string, equipmentDetails: { name: string, model: string | null, serial_number: string | null }) => void;
}

const EquipmentForm: React.FC<{ clientId: string, onSubmit: (data: Equipment) => void, onCancel: () => void }> = ({ clientId, onSubmit, onCancel }) => {
    const form = useForm<NewEquipmentFormValues>({
        resolver: zodResolver(newEquipmentSchema),
        defaultValues: { name: "", model: "", serial_number: "" },
    });
    const { createEquipment } = useEquipments(clientId);

    const handleSubmit = async (data: NewEquipmentFormValues) => {
        try {
            const newEquipment = await createEquipment.mutateAsync({
                client_id: clientId,
                name: data.name,
                model: data.model || undefined,
                serial_number: data.serial_number || undefined,
            });
            showSuccess(`Equipamento '${data.name}' criado com sucesso!`);
            onSubmit(newEquipment);
        } catch (error) {
            console.error("Erro ao criar equipamento:", error);
            showError("Erro ao criar novo equipamento. Tente novamente.");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome do Equipamento *</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Notebook, Servidor" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Modelo (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Dell XPS 13" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="serial_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nº de Série (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: ABC123XYZ" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={createEquipment.isPending}>
                        Criar Equipamento
                    </Button>
                </div>
            </form>
        </Form>
    );
};


const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({ clientId, value, onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { equipments, isLoading } = useEquipments(clientId);

  // Efeito para pré-selecionar o equipamento se houver apenas um, ou se o valor atual for inválido
  useEffect(() => {
    if (equipments.length > 0 && !value) {
        const firstEquipment = equipments[0];
        onChange(firstEquipment.id, { 
            name: firstEquipment.name, 
            model: firstEquipment.model, 
            serial_number: firstEquipment.serial_number 
        });
    }
  }, [equipments, value, onChange]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "NEW_EQUIPMENT") {
      setIsModalOpen(true);
    } else {
      const selectedEquipment = equipments.find(e => e.id === selectedValue);
      if (selectedEquipment) {
        onChange(selectedEquipment.id, {
            name: selectedEquipment.name,
            model: selectedEquipment.model,
            serial_number: selectedEquipment.serial_number,
        });
      }
    }
  };
  
  const handleNewEquipmentSubmit = (newEquipment: Equipment) => {
    // Seleciona o novo equipamento criado
    onChange(newEquipment.id, {
        name: newEquipment.name,
        model: newEquipment.model,
        serial_number: newEquipment.serial_number,
    });
    setIsModalOpen(false);
  };

  // Se o cliente não estiver selecionado, não mostra o seletor
  if (!clientId) {
    return (
        <Select disabled>
            <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente primeiro" />
            </SelectTrigger>
        </Select>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  const selectedEquipment = equipments.find(e => e.id === value);
  const displayValue = selectedEquipment ? `${selectedEquipment.name} (${selectedEquipment.model || 'N/A'})` : "Selecione ou adicione um equipamento";

  return (
    <>
      <Select onValueChange={handleSelectChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione ou adicione um equipamento">
            {displayValue}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {equipments.map((equipment) => (
            <SelectItem key={equipment.id} value={equipment.id}>
              {equipment.name} ({equipment.model || 'N/A'})
            </SelectItem>
          ))}
          <SelectItem value="NEW_EQUIPMENT" className="text-primary font-medium">
            <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Adicionar Novo Equipamento
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Modal de Criação de Equipamento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Equipamento</DialogTitle>
          </DialogHeader>
          <EquipmentForm 
            clientId={clientId}
            onSubmit={handleNewEquipmentSubmit} 
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EquipmentSelector;