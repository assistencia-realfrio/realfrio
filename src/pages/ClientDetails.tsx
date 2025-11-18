"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Plus, MapPin, Phone, Mail, FolderOpen, Clock, FileText, Calendar, User, Briefcase, Factory } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { TimeEntryList } from '@/components/TimeEntryList';
import { ActivityFeed } from '@/components/ActivityFeed';
import { EquipmentList } from '@/components/EquipmentList';
import { ServiceOrderList } from '@/components/ServiceOrderList';
import { ClientEstablishmentList } from '@/components/ClientEstablishmentList';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ClientForm, { Client } from '@/components/ClientForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// --- Data Fetching ---
const fetchClientDetails = async (clientId: string): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const ClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: client, isLoading, error, refetch } = useQuery<Client, Error>({
    queryKey: ['clientDetails', clientId],
    queryFn: () => fetchClientDetails(clientId!),
    enabled: !!clientId,
  });

  const handleBack = () => {
    navigate('/clients');
  };

  const handleClientUpdate = () => {
    refetch();
    setIsEditDialogOpen(false);
    showSuccess('Client updated successfully!');
  };

  const handleDeleteClient = async () => {
    if (!client) return;
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) throw error;

      showSuccess(`Client "${client.name}" deleted successfully.`);
      navigate('/clients');
    } catch (e) {
      console.error('Error deleting client:', e);
      showError('Failed to delete client.');
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading client details...</div>;
  }

  if (error || !client) {
    return <div className="p-4 text-red-500">Error loading client details: {error?.message || 'Client not found.'}</div>;
  }

  const clientStatusVariant = useMemo(() => {
    switch (client.status) {
      case 'Ativo':
        return 'default';
      case 'Inativo':
        return 'destructive';
      default:
        return 'secondary';
    }
  }, [client.status]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center space-x-4 min-w-0">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-shrink-0 space-x-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="hidden sm:inline-flex">
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Client</DialogTitle>
              </DialogHeader>
              <ClientForm client={client} onSuccess={handleClientUpdate} />
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={handleDeleteClient} className="hidden sm:inline-flex">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Client Info and Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Details Card (Col 1) */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Client Information
              <Badge variant={clientStatusVariant}>{client.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem icon={User} label="Contact" value={client.contact} />
            <DetailItem icon={Mail} label="Email" value={client.email} />
            <DetailItem icon={MapPin} label="Locality" value={client.locality} />
            <DetailItem icon={Calendar} label="Created At" value={new Date(client.created_at).toLocaleDateString()} />
            <DetailItem icon={Clock} label="Last Updated" value={new Date(client.updated_at).toLocaleDateString()} />
            
            {client.maps_link && (
              <DetailLink icon={MapPin} label="Maps Link" href={client.maps_link} />
            )}
            {client.google_drive_link && (
              <DetailLink icon={FolderOpen} label="Google Drive" href={client.google_drive_link} />
            )}
          </CardContent>
        </Card>

        {/* Tabs (Col 2 & 3) */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="establishments">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="establishments">
                <Factory className="h-4 w-4 mr-2" /> Establishments
              </TabsTrigger>
              <TabsTrigger value="orders">
                <FileText className="h-4 w-4 mr-2" /> Service Orders
              </TabsTrigger>
              <TabsTrigger value="equipment">
                <Briefcase className="h-4 w-4 mr-2" /> Equipment
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Clock className="h-4 w-4 mr-2" /> Activity
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="establishments" className="mt-4">
              <ClientEstablishmentList clientId={clientId!} />
            </TabsContent>
            
            <TabsContent value="orders" className="mt-4">
              <ServiceOrderList clientId={clientId!} />
            </TabsContent>

            <TabsContent value="equipment" className="mt-4">
              <EquipmentList clientId={clientId!} />
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <ActivityFeed entityType="client" entityId={clientId!} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Helper component for displaying details
interface DetailItemProps {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-3">
    <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base font-semibold text-gray-900 break-words">{value || 'N/A'}</p>
    </div>
  </div>
);

// Helper component for displaying links
interface DetailLinkProps {
  icon: React.ElementType;
  label: string;
  href: string;
}

const DetailLink: React.FC<DetailLinkProps> = ({ icon: Icon, label, href }) => (
  <div className="flex items-start space-x-3">
    <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-base font-semibold text-blue-600 hover:text-blue-700 underline truncate block max-w-full"
      >
        {href}
      </a>
    </div>
  </div>
);


export default ClientDetails;