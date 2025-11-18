"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

// Define the Client interface
export interface Client {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  status: string;
  locality: string | null;
  maps_link: string | null;
  google_drive_link: string | null;
  created_at: string;
  updated_at: string;
}

const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  contact: z.string().nullable(),
  email: z.string().email('Invalid email address').nullable().or(z.literal('')),
  status: z.enum(['Ativo', 'Inativo', 'Pendente']),
  locality: z.string().nullable(),
  maps_link: z.string().url('Invalid URL').nullable().or(z.literal('')),
  google_drive_link: z.string().url('Invalid URL').nullable().or(z.literal('')),
});

// Export the form data type to fix TS2614 errors
export type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  // Props for Editing mode (internal submission)
  client?: Client;
  onSuccess?: () => void;
  
  // Props for Creation mode (external submission)
  onSubmit?: (data: ClientFormData) => Promise<void>;
  onCancel?: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSuccess, onSubmit, onCancel }) => {
  const isEditing = !!client;

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name || '',
      contact: client?.contact || '',
      email: client?.email || '',
      status: (client?.status as 'Ativo' | 'Inativo' | 'Pendente') || 'Ativo',
      locality: client?.locality || '',
      maps_link: client?.maps_link || '',
      google_drive_link: client?.google_drive_link || '',
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        contact: client.contact || '',
        email: client.email || '',
        status: (client.status as 'Ativo' | 'Inativo' | 'Pendente'),
        locality: client.locality || '',
        maps_link: client.maps_link || '',
        google_drive_link: client.google_drive_link || '',
      });
    }
  }, [client, form]);

  const handleInternalSubmit = async (values: ClientFormData) => {
    if (!isEditing || !client || !onSuccess) return;

    const payload = {
      ...values,
      contact: values.contact || null,
      email: values.email || null,
      locality: values.locality || null,
      maps_link: values.maps_link || null,
      google_drive_link: values.google_drive_link || null,
    };

    try {
      const { error } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', client.id);

      if (error) throw error;
      showSuccess('Client updated successfully.');
      onSuccess();
    } catch (error) {
      console.error('Submission error:', error);
      showError('Failed to update client.');
    }
  };

  const handleSubmit = (values: ClientFormData) => {
    if (isEditing) {
      return handleInternalSubmit(values);
    } else if (onSubmit) {
      // External submission handler for creation mode
      return onSubmit(values);
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Client Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Person</FormLabel>
              <FormControl>
                <Input placeholder="Contact Name" {...field} value={field.value || ''} />
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
                <Input placeholder="client@example.com" {...field} value={field.value || ''} />
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
              <FormLabel>Locality</FormLabel>
              <FormControl>
                <Input placeholder="City, State" {...field} value={field.value || ''} />
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
              <FormLabel>Google Maps Link</FormLabel>
              <FormControl>
                <Input placeholder="https://maps.app.goo.gl/..." {...field} value={field.value || ''} />
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
              <FormLabel>Google Drive Link</FormLabel>
              <FormControl>
                <Input placeholder="https://drive.google.com/..." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Client'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientForm;