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
  initialData?: Equipment;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ clientId, onSubmit, onCancel, initialData }) => {
    const form = useForm<EquipmentFormData>({
        resolver: zodResolver(equipmentFormSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            brand: initialData.brand || "",
            model: initialData.model || "",
            serial_number: initialData.serial_number || "",
        } : { 
            name: "", 
            brand: "", 
            model: "", 
            serial_number: "",
        },
    });
    const { createEquipment, updateEquipment } = useEquipments(clientId);
    const isEditing = !!initialData?.id;

    const handleSubmit = async (data: EquipmentFormData) => {
        try {
            let resultEquipment: Equipment;
            if (isEditing && initialData?.id) {
                const { updatedEquipment } = await updateEquipment.mutateAsync({
                    id: initialData.id,
                    client_id: clientId,
                    name: data.name,
                    brand: data.brand || undefined,
                    model: data.model || undefined,
                    serial_number: data.serial_number || undefined,
                });
                resultEquipment = updatedEquipment;
                showSuccess(`Equipamento '${data.name}' atualizado com sucesso!`);
            } else {
                resultEquipment = await createEquipment.mutateAsync({
                    client_id: clientId,
                    name: data.name,
                    brand: data.brand || undefined,
                    model: data.model || undefined,
                    serial_number: data.serial_number || undefined,
                });
                showSuccess(`Equipamento '${data.name}' criado com sucesso!`);
            }
            onSubmit(resultEquipment);
        } catch (error) {
            console.error("Erro ao salvar equipamento:", error);
            showError("Erro ao salvar equipamento. Tente novamente.");
        }
    };

    const isPending = createEquipment.isPending || updateEquipment.isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="uppercase">Nome do Equipamento *</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Notebook, Servidor" {...field} className="uppercase" />
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
                            <FormLabel className="uppercase">Marca (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Dell, Apple, Samsung" {...field} className="uppercase" />
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
                            <FormLabel className="uppercase">Modelo (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: XPS 13, iPhone 15" {...field} className="uppercase" />
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
                            <FormLabel className="uppercase">Nº de Série (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: ABC123XYZ" {...field} className="uppercase" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isPending} className="w-full sm:w-auto uppercase">
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isPending} className="w-full sm:w-auto uppercase">
                        {isEditing ? "Salvar Alterações" : "Criar Equipamento"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default EquipmentForm;