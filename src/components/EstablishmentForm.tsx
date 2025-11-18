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
import { Establishment } from "@/hooks/useClientEstablishments";

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  locality: z.string().optional(),
  google_maps_link: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EstablishmentFormProps {
  clientId: string;
  initialData?: Establishment;
  onSubmit: (data: Establishment) => void;
  onCancel: () => void;
  isPending: boolean;
}

const EstablishmentForm: React.FC<EstablishmentFormProps> = ({ clientId, initialData, onSubmit, onCancel, isPending }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      locality: "",
      google_maps_link: "",
    },
  });

  const handleSubmit = (data: FormData) => {
    const submissionData = {
      id: initialData?.id,
      client_id: clientId,
      ...data,
    };
    onSubmit(submissionData as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Estabelecimento *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Loja Principal, Armazém Central" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="locality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Localidade (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Caldas da Rainha, Leiria" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="google_maps_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Google Maps (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Link do Google Maps ou coordenadas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {initialData ? "Salvar Alterações" : "Criar Estabelecimento"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EstablishmentForm;