import React from 'react';
import { FileText, Wrench, HardDrive, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type View = 'details' | 'orders' | 'equipments' | 'history';

interface ClientDetailsBottomNavProps {
  selectedView: View;
  onSelectView: (view: View) => void;
}

const navItems: { id: View; icon: React.ElementType; label: string }[] = [
  { id: 'details', icon: FileText, label: 'Detalhes' },
  { id: 'orders', icon: Wrench, label: 'Ordens' },
  { id: 'equipments', icon: HardDrive, label: 'Equipamentos' },
  { id: 'history', icon: History, label: 'Histórico' },
];

const ClientDetailsBottomNav: React.FC<ClientDetailsBottomNavProps> = ({ selectedView, onSelectView }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 lg:left-64"> {/* Alterado aqui */}
      <div className="flex justify-around items-center h-16 gap-1 px-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "flex flex-col items-center justify-center h-14 flex-1 rounded-lg p-1 text-center",
              selectedView === item.id ? 'bg-muted text-primary' : 'text-muted-foreground',
            )}
            onClick={() => onSelectView(item.id)}
            aria-label={item.label}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs mt-1">{item.label.toUpperCase()}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ClientDetailsBottomNav;