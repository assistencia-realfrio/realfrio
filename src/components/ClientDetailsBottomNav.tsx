import React from 'react';
import ReactDOM from 'react-dom';
import { FileText, Wrench, HardDrive, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type View = 'details' | 'orders' | 'equipments' | 'establishments';

interface ClientDetailsBottomNavProps {
  selectedView: View;
  onSelectView: (view: View) => void;
}

const navItems: { id: View; icon: React.ElementType; label: string }[] = [
  { id: 'details', icon: FileText, label: 'Detalhes' },
  { id: 'orders', icon: Wrench, label: 'Ordens' },
  { id: 'equipments', icon: HardDrive, label: 'Equipamentos' },
  { id: 'establishments', icon: Building, label: 'Estabelecimentos' },
];

const ClientDetailsBottomNav: React.FC<ClientDetailsBottomNavProps> = ({ selectedView, onSelectView }) => {
  // Renderiza o componente usando um portal
  return ReactDOM.createPortal(
    <div className="flex justify-around items-center h-16 gap-1 px-2 w-full">
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
          <span className="text-xs mt-1">{item.label}</span>
        </Button>
      ))}
    </div>,
    document.getElementById('top-nav-portal-root') as HTMLElement // Onde o portal será renderizado
  );
};

export default ClientDetailsBottomNav;