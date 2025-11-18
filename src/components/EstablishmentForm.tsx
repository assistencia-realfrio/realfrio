import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Establishment, EstablishmentFormValues } from "@/hooks/useClientEstablishments";

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  address: z.string().optional(),
  contact_person: z.string().optional(),
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
      address: "",
      contact_person: "",
    },
  });

  const handleSubmit = (data: FormData) => {
    const submissionData = {
      id: initialData?.id,
      client_id: clientId,
      ...data,
    };
    // A mutação real é tratada no componente pai, aqui apenas passamos os dados
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Rua, número, cidade..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact_person"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pessoa de Contato (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Gerente João" {...field} />
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