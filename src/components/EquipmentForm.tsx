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
  google_drive_link: z.string().optional().or(z.literal('')), // NOVO: Campo para o link do Google Drive
});

export type EquipmentFormData = z.infer<typeof equipmentFormSchema>;

interface EquipmentFormProps {
  clientId: string;
  onSubmit: (equipment: Equipment) => void;
  onCancel: () => void;
  initialData?: Equipment; // Agora aceita um objeto Equipment completo para edição
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ clientId, onSubmit, onCancel, initialData }) => {
    const form = useForm<EquipmentFormData>({
        resolver: zodResolver(equipmentFormSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            brand: initialData.brand || "",
            model: initialData.model || "",
            serial_number: initialData.serial_number || "",
            google_drive_link: initialData.google_drive_link || "", // NOVO: Definindo valor padrão
        } : { 
            name: "", 
            brand: "", 
            model: "", 
            serial_number: "",
            google_drive_link: "", // NOVO: Definindo valor padrão
        },
    });
    const { createEquipment, updateEquipment } = useEquipments(clientId);
    const isEditing = !!initialData?.id;

    const handleSubmit = async (data: EquipmentFormData) => {
        try {
            let resultEquipment: Equipment;
            if (isEditing && initialData?.id) {
                // Atualizar equipamento existente
                resultEquipment = await updateEquipment.mutateAsync({
                    id: initialData.id,
                    client_id: clientId, // client_id é necessário para a mutação, mas não é alterado no form
                    name: data.name,
                    brand: data.brand || undefined,
                    model: data.model || undefined,
                    serial_number: data.serial_number || undefined,
                    google_drive_link: data.google_drive_link || undefined, // NOVO: Enviando google_drive_link
                });
                showSuccess(`EQUIPAMENTO '${data.name}' ATUALIZADO COM SUCESSO!`);
            } else {
                // Criar novo equipamento
                resultEquipment = await createEquipment.mutateAsync({
                    client_id: clientId,
                    name: data.name,
                    brand: data.brand || undefined,
                    model: data.model || undefined,
                    serial_number: data.serial_number || undefined,
                    google_drive_link: data.google_drive_link || undefined, // NOVO: Enviando google_drive_link
                });
                showSuccess(`EQUIPAMENTO '${data.name}' CRIADO COM SUCESSO!`);
            }
            onSubmit(resultEquipment);
        } catch (error) {
            console.error("Erro ao salvar equipamento:", error);
            showError("ERRO AO SALVAR EQUIPAMENTO. TENTE NOVAMENTE.");
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
                            <FormLabel>Nome do Equipamento *</FormLabel>
                            <FormControl>
                                <Input 
                                  placeholder="Ex: Notebook, Servidor" 
                                  {...field} 
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
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
                                <Input 
                                  placeholder="Ex: Dell, Apple, Samsung" 
                                  {...field} 
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
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
                                <Input 
                                  placeholder="Ex: XPS 13, iPhone 15" 
                                  {...field} 
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
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
                                <Input 
                                  placeholder="Ex: ABC123XYZ" 
                                  {...field} 
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="google_drive_link"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Google Drive (Opcional)</FormLabel>
                            <FormControl>
                                <Input 
                                  placeholder="Link da pasta ou arquivo no Google Drive" 
                                  {...field} 
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2"> {/* Ajustado para empilhar em mobile */}
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isPending} className="w-full sm:w-auto">
                        CANCELAR
                    </Button>
                    <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                        {isEditing ? "SALVAR ALTERAÇÕES" : "CRIAR EQUIPAMENTO"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default EquipmentForm;