import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { showSuccess, showError } from "@/utils/toast";
import { useProfile, Profile } from "@/hooks/useProfile";

const profileFormSchema = z.object({
  first_name: z.string().min(1, { message: "O primeiro nome é obrigatório." }).nullable(),
  last_name: z.string().min(1, { message: "O último nome é obrigatório." }).nullable(),
  store: z.enum(["CALDAS DA RAINHA", "PORTO DE MÓS"]).nullable(), // NOVO: Campo de loja
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  initialData: Profile;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { updateProfile } = useProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: initialData.first_name || "",
      last_name: initialData.last_name || "",
      store: initialData.store || null, // Definindo valor padrão para a loja
    },
  });

  const handleSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile.mutateAsync({
        first_name: data.first_name || undefined,
        last_name: data.last_name || undefined,
        store: data.store, // Enviando a loja
      });
      showSuccess("Perfil atualizado com sucesso!");
      onSuccess();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      showError("Erro ao atualizar perfil. Tente novamente.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primeiro Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: João" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Último Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Silva" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* NOVO: Campo de Seleção de Loja Padrão */}
        <FormField
          control={form.control}
          name="store"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loja Padrão</FormLabel>
              <Select 
                // Se o valor for 'NONE_SELECTED', define como null. Caso contrário, usa o valor.
                onValueChange={(value) => field.onChange(value === "NONE_SELECTED" ? null : value)} 
                // Se o valor for null, usa 'NONE_SELECTED' para o Select, evitando string vazia.
                value={field.value || "NONE_SELECTED"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a loja padrão" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Usando um valor não vazio para representar o estado nulo */}
                  <SelectItem value="NONE_SELECTED">Nenhuma (Ver todas)</SelectItem>
                  <SelectItem value="CALDAS DA RAINHA">Caldas da Rainha</SelectItem>
                  <SelectItem value="PORTO DE MÓS">Porto de Mós</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={updateProfile.isPending} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" disabled={updateProfile.isPending} className="w-full sm:w-auto">
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProfileForm;