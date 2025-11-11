import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Equipment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';

interface EquipmentListProps {
  clientId: string;
}

const EquipmentList: React.FC<EquipmentListProps> = ({ clientId }) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEquipment = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('equipments')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEquipment(data as Equipment[] || []);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        showError('Erro ao carregar equipamentos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipment();
  }, [clientId]);

  const handleNavigateToEquipment = (equipmentId: string) => {
    navigate(`/equipment/${equipmentId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Equipamentos ({equipment.length})</CardTitle>
        <Button size="sm" onClick={() => navigate(`/equipment/new?clientId=${clientId}`)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Equipamento
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {equipment.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum equipamento cadastrado para este cliente.</p>
        ) : (
          <div className="space-y-3">
            {equipment.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleNavigateToEquipment(item.id)}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Wrench className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.model || 'Modelo N/A'} | S/N: {item.serial_number || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentList;