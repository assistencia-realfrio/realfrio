import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Check } from "lucide-react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Schema de validação para o formulário de novo equipamento
const newEquipmentSchema = z.object({
  name: z.string().min(3, { message: "O nome do equipamento é obrigatório." }),
  brand: z.string().optional().or(z.literal('')), // Novo campo
  model: z.string().optional().or(z.literal('')),
  serial_number: z.string().optional().or(z.literal('')),
});

type NewEquipmentFormValues = z.infer<typeof newEquipmentSchema>;

interface EquipmentSelectorProps {
  clientId: string;
  value: string; // Deve ser o ID do equipamento
  onChange: (equipmentId: string, equipmentDetails: { name: string, brand: string | null, model: string | null, serial_number: string | null }) => void;
}

const EquipmentForm: React.FC<{ clientId: string, onSubmit: (data: Equipment) => void, onCancel: () => void }> = ({ clientId, onSubmit, onCancel }) => {
    const form = useForm<NewEquipmentFormValues>({
        resolver: zodResolver(newEquipmentSchema),
        defaultValues: { name: "", brand: "", model: "", serial_number: "" },
    });
    const { createEquipment } = useEquipments(clientId);

    const handleSubmit = async (data: NewEquipmentFormValues) => {
        try {
            const newEquipment = await createEquipment.mutateAsync({
                client_id: clientId,
                name: data.name,
                brand: data.brand || undefined, // Passando a marca
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
                
                {/* Novo Campo: Marca */}
                <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Marca (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Dell, Apple, Samsung" {...field} />
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
                                <Input placeholder="Ex: XPS 13, iPhone 15" {...field} />
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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { equipments, isLoading } = useEquipments(clientId);

  // Efeito para pré-selecionar o equipamento se houver apenas um, ou se o valor atual for inválido
  useEffect(() => {
    if (equipments.length > 0 && !value) {
        const firstEquipment = equipments[0];
        onChange(firstEquipment.id, { 
            name: firstEquipment.name, 
            brand: firstEquipment.brand, // Incluindo a marca
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
            brand: selectedEquipment.brand, // Incluindo a marca
            model: selectedEquipment.model,
            serial_number: selectedEquipment.serial_number,
        });
        setIsPopoverOpen(false); // Fecha o popover após a seleção
      }
    }
  };
  
  const handleNewEquipmentSubmit = (newEquipment: Equipment) => {
    // Seleciona o novo equipamento criado
    onChange(newEquipment.id, {
        name: newEquipment.name,
        brand: newEquipment.brand, // Incluindo a marca
        model: newEquipment.model,
        serial_number: newEquipment.serial_number,
    });
    setIsModalOpen(false);
  };

  // Se o cliente não estiver selecionado, não mostra o seletor
  if (!clientId) {
    return (
        <Button
            variant="outline"
            role="combobox"
            disabled
            className="w-full justify-between text-muted-foreground"
        >
            Selecione um cliente primeiro
            <PlusCircle className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  const selectedEquipment = equipments.find(e => e.id === value);
  const displayValue = selectedEquipment 
    ? `${selectedEquipment.name} (${selectedEquipment.brand || 'N/A'} - ${selectedEquipment.model || 'N/A'})` 
    : "Selecione ou adicione um equipamento";

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isPopoverOpen}
            className="w-full justify-between"
          >
            {displayValue}
            <PlusCircle className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Buscar equipamento..." />
            <CommandList>
              <CommandEmpty>Nenhum equipamento encontrado.</CommandEmpty>
              <CommandGroup>
                {equipments.map((equipment) => (
                  <CommandItem
                    key={equipment.id}
                    // Usamos uma string combinada para que a busca funcione em nome, marca e modelo
                    value={`${equipment.name} ${equipment.brand || ''} ${equipment.model || ''}`}
                    onSelect={() => handleSelectChange(equipment.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === equipment.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {equipment.name} ({equipment.brand || 'N/A'} - {equipment.model || 'N/A'})
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup>
                <CommandItem
                  key="NEW_EQUIPMENT"
                  value="Adicionar Novo Equipamento"
                  onSelect={() => handleSelectChange("NEW_EQUIPMENT")}
                  className="text-primary font-medium cursor-pointer"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Novo Equipamento
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

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