import React from 'react';
import { FileText, Wrench, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type View = 'details' | 'orders' | 'equipments';

interface ClientDetailsBottomNavProps {
  selectedView: View;
  onSelectView: (view: View) => void;
}

const navItems: { id: View; icon: React.ElementType; label: string }[] = [
  { id: 'details', icon: FileText, label: 'Detalhes' },
  { id: 'orders', icon: Wrench, label: 'Ordens' },
  { id: 'equipments', icon: HardDrive, label: 'Equipamentos' },
];

const ClientDetailsBottomNav: React.FC<ClientDetailsBottomNavProps> = ({ selectedView, onSelectView }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50 lg:left-64">
      <div className="flex justify-center items-center h-16 space-x-4">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "flex flex-col items-center justify-center h-14 w-20 rounded-lg p-1 text-center",
              selectedView === item.id ? 'bg-muted text-primary' : 'text-muted-foreground',
            )}
            onClick={() => onSelectView(item.id)}
            aria-label={item.label}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ClientDetailsBottomNav;