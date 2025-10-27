import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { showSuccess, showError } from "@/utils/toast";
import { useEquipments, Equipment, EquipmentFormValues } from "@/hooks/useEquipments";

// Schema de validação para o formulário de novo equipamento
const equipmentFormSchema = z.object({
  name: z.string().min(3, { message: "O nome do equipamento é obrigatório." }),
  brand: z.string().optional().or(z.literal('')),
  model: z.string().optional().or(z.literal('')),
  serial_number: z.string().optional().or(z.literal('')),
});

export type EquipmentFormData = z.infer<typeof equipmentFormSchema>;

interface EquipmentFormProps {
  clientId: string;
  onSubmit: (equipment: Equipment) => void;
  onCancel: () => void;
  initialData?: EquipmentFormData;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ clientId, onSubmit, onCancel, initialData }) => {
    const form = useForm<EquipmentFormData>({
        resolver: zodResolver(equipmentFormSchema),
        defaultValues: initialData || { name: "", brand: "", model: "", serial_number: "" },
    });
    const { createEquipment } = useEquipments(clientId);

    const handleSubmit = async (data: EquipmentFormData) => {
        try {
            const newEquipment = await createEquipment.mutateAsync({
                client_id: clientId,
                name: data.name,
                brand: data.brand || undefined,
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

export default EquipmentForm;