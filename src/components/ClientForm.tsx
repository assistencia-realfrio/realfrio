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
import { showSuccess } from "@/utils/toast";

// Definição do Schema de Validação
const formSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  billing_name: z.string().nullable().optional(),
  contact: z.string().nullable().optional(),
  email: z.string().email({ message: "E-mail inválido." }).nullable().optional().or(z.literal('')),
  store: z.enum(["CALDAS DA RAINHA", "PORTO DE MÓS"], { message: "Selecione uma loja." }),
  maps_link: z.string().nullable().optional(),
  locality: z.string().nullable().optional(),
  google_drive_link: z.string().nullable().optional(),
});

export type ClientFormValues = z.infer<typeof formSchema>;

interface ClientFormProps {
  initialData?: ClientFormValues;
  onSubmit: (data: ClientFormValues) => void;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      billing_name: "",
      contact: "",
      email: "",
      store: "CALDAS DA RAINHA",
      maps_link: "",
      locality: "",
      google_drive_link: "",
    },
  });

  const handleSubmit = (data: ClientFormValues) => {
    onSubmit(data);
    showSuccess(`Cliente ${initialData ? 'atualizado' : 'criado'} com sucesso!`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="uppercase">Nome do Cliente/Empresa *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Empresa XYZ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="billing_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="uppercase">Nome de Faturação (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Nome para a fatura" 
                  {...field} 
                  value={field.value || ""}
                />
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
              <FormLabel className="uppercase">Localidade (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Caldas da Rainha, Leiria" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maps_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="uppercase">Maps (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Link do Google Maps ou coordenadas" 
                  {...field} 
                  value={field.value || ""}
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
              <FormLabel className="uppercase">Google Drive (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Link da pasta ou arquivo no Google Drive" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="uppercase">Telefone/Contato (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(XX) XXXXX-XXXX" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="uppercase">E-mail (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="contato@exemplo.com" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="store"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="uppercase">Loja *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="uppercase">
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CALDAS DA RAINHA" className="uppercase">Caldas da Rainha</SelectItem>
                  <SelectItem value="PORTO DE MÓS" className="uppercase">Porto de Mós</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto uppercase">
            Cancelar
          </Button>
          <Button type="submit" className="w-full sm:w-auto uppercase">
            {initialData ? "Salvar Alterações" : "Criar Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientForm;