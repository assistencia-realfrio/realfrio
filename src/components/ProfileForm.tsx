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
import { showSuccess, showError } from "@/utils/toast";
import { useProfile, Profile } from "@/hooks/useProfile";

const profileFormSchema = z.object({
  first_name: z.string().min(1, { message: "O primeiro nome é obrigatório." }).nullable(),
  last_name: z.string().min(1, { message: "O último nome é obrigatório." }).nullable(),
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
    },
  });

  const handleSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile.mutateAsync({
        first_name: data.first_name || undefined,
        last_name: data.last_name || undefined,
      });
      showSuccess("PERFIL ATUALIZADO COM SUCESSO!");
      onSuccess();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      showError("ERRO AO ATUALIZAR PERFIL. TENTE NOVAMENTE.");
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
              <FormLabel>PRIMEIRO NOME *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: João" 
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
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ÚLTIMO NOME *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Silva" 
                  {...field} 
                  value={field.value || ""} 
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4"> {/* Ajustado para empilhar em mobile */}
          <Button type="button" variant="outline" onClick={onCancel} disabled={updateProfile.isPending} className="w-full sm:w-auto">
            CANCELAR
          </Button>
          <Button type="submit" disabled={updateProfile.isPending} className="w-full sm:w-auto">
            SALVAR ALTERAÇÕES
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProfileForm;