import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, ClientFormValues, StoreLocation } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';

const storeLocations: StoreLocation[] = ["CALDAS DA RAINHA", "PORTO DE MÓS"];

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  contact: z.string().nullable().optional(),
  email: z.string().email({ message: "Email inválido." }).nullable().optional().or(z.literal('')),
  store: z.enum(storeLocations as [string, ...string[]]).nullable().optional(),
  maps_link: z.string().url({ message: "Link do Google Maps inválido." }).nullable().optional().or(z.literal('')),
  locality: z.string().nullable().optional(),
  google_drive_link: z.string().url({ message: "Link do Google Drive inválido." }).nullable().optional().or(z.literal('')),
});

interface ClientFormProps {
  initialData?: Client;
  onSuccess: (client: Client) => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ initialData, onSuccess }) => {
  const { user } = useSession();
  const isEdit = !!initialData;

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      contact: initialData?.contact || "",
      email: initialData?.email || "",
      store: initialData?.store || null,
      maps_link: initialData?.maps_link || "",
      locality: initialData?.locality || "",
      google_drive_link: initialData?.google_drive_link || "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: ClientFormValues) => {
    if (!user?.id) {
      showError("Usuário não autenticado.");
      return;
    }

    const payload = {
      ...values,
      // Ensure empty strings are converted to null for database consistency
      contact: values.contact || null,
      email: values.email || null,
      maps_link: values.maps_link || null,
      locality: values.locality || null,
      google_drive_link: values.google_drive_link || null,
      store: values.store || null,
    };

    try {
      let data;
      let error;

      if (isEdit) {
        ({ data, error } = await supabase
          .from('clients')
          .update(payload)
          .eq('id', initialData.id)
          .select()
          .single());
      } else {
        ({ data, error } = await supabase
          .from('clients')
          .insert({ ...payload, created_by: user.id })
          .select()
          .single());
      }

      if (error) throw error;

      onSuccess(data as Client);
    } catch (e) {
      console.error("Erro ao salvar cliente:", e);
      showError(`Falha ao ${isEdit ? 'atualizar' : 'criar'} cliente.`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Cliente" : "Novo Cliente"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo ou razão social" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato (Telefone/Celular)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: +351 912 345 678" {...field} value={field.value || ''} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="locality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localidade / Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Lisboa" {...field} value={field.value || ''} />
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
                    <FormLabel>Loja Associada</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a loja" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {storeLocations.map((store) => (
                          <SelectItem key={store} value={store}>
                            {store}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="maps_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link do Google Maps</FormLabel>
                  <FormControl>
                    <Input placeholder="URL do Google Maps" {...field} value={field.value || ''} />
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
                  <FormLabel>Link do Google Drive (Documentação)</FormLabel>
                  <FormControl>
                    <Input placeholder="URL do Google Drive" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                isEdit ? "Salvar Alterações" : "Criar Cliente"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ClientForm;