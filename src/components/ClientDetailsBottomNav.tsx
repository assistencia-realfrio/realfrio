import React from 'react';
import ReactDOM from 'react-dom'; // Importar ReactDOM
import { FileText, Wrench, HardDrive, Building, ArrowRight } from 'lucide-react'; // Adicionado Building e ArrowRight
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type View = 'details' | 'orders' | 'equipments' | 'establishments'; // Adicionado 'establishments'

interface ClientDetailsBottomNavProps {
  selectedView: View;
  onSelectView: (view: View) => void;
}

const navItems: { id: View; icon: React.ElementType; label: string }[] = [
  { id: 'details', icon: FileText, label: 'Detalhes' },
  { id: 'orders', icon: Wrench, label: 'Ordens' },
  { id: 'equipments', icon: HardDrive, label: 'Equipamentos' },
  { id: 'establishments', icon: Building, label: 'Estabelecimentos' }, // Novo item
];

const ClientDetailsBottomNav: React.FC<ClientDetailsBottomNavProps> = ({ selectedView, onSelectView }) => {
  // Renderiza o componente usando um portal
  return ReactDOM.createPortal(
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 lg:left-64">
      <div className="flex justify-around items-center h-16 gap-1 px-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "relative flex flex-col items-center justify-center h-14 flex-1 rounded-none p-1 text-center", // Removido rounded-lg
              selectedView === item.id ? 'text-primary' : 'text-muted-foreground',
            )}
            onClick={() => onSelectView(item.id)}
            aria-label={item.label}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs mt-1">{item.label}</span>
            {selectedView === item.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" /> // Sublinhado azul
            )}
          </Button>
        ))}
      </div>
    </div>,
    document.getElementById('bottom-nav-root') as HTMLElement // Onde o portal será renderizado
  );
};

export default ClientDetailsBottomNav;