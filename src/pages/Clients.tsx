"use client";

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ListFilter, ChevronDown, ChevronUp, MapPin, Mail, User, Briefcase, Factory } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ClientForm, { ClientFormData, Client } from "@/components/ClientForm";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { showSuccess, showError } from '@/utils/toast';

const Clients = () => {
  const navigate = useNavigate();
  const { data: clients, isLoading, error, refetch } = useClients();
  const createClientMutation = useCreateClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'created_at'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  const filteredAndSortedClients = useMemo(() => {
    if (!clients) return [];

    let filtered = clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (client.locality?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [clients, searchTerm, statusFilter, sortBy, sortDirection]);

  const handleNewClientSubmit = async (data: ClientFormData) => {
    try {
      await createClientMutation.mutateAsync(data);
      showSuccess('Client created successfully!');
      setIsNewClientModalOpen(false);
      // refetch is handled by mutation onSuccess
    } catch (e) {
      console.error('Error creating client:', e);
      showError('Failed to create client.');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'default';
      case 'Inativo':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleSort = (column: 'name' | 'status' | 'created_at') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: 'name' | 'status' | 'created_at' }) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />;
  };

  if (isLoading) return <div className="p-4">Loading clients...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading clients: {error.message}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clients ({clients?.length || 0})</h1>
        <Dialog open={isNewClientModalOpen} onOpenChange={setIsNewClientModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsNewClientModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Client</DialogTitle>
            </DialogHeader>
            <ClientForm 
              onSubmit={handleNewClientSubmit}
              onCancel={() => setIsNewClientModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or locality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <ListFilter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Client Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50" 
                onClick={() => handleSort('name')}
              >
                Name <SortIcon column="name" />
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Locality</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50" 
                onClick={() => handleSort('status')}
              >
                Status <SortIcon column="status" />
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedClients.map((client) => (
              <TableRow key={client.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/clients/${client.id}`)}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.contact || client.email || 'N/A'}</TableCell>
                <TableCell>{client.locality || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(client.status)}>{client.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                        <span className="sr-only">Open menu</span>
                        <ListFilter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                        <User className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled>
                        <Briefcase className="mr-2 h-4 w-4" /> New Service Order
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <Factory className="mr-2 h-4 w-4" /> Add Establishment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredAndSortedClients.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">
            No clients found matching your criteria.
          </div>
        )}
      </Card>
    </div>
  );
};

export default Clients;