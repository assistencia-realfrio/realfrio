import React from 'react';
import { FileText, Wrench, Paperclip } from 'lucide-react'; // Removido History
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type View = 'details' | 'orders' | 'attachments'; // 'history' removido do tipo

interface EquipmentDetailsBottomNavProps {
  selectedView: View;
  onSelectView: (view: View) => void;
}

const navItems: { id: View; icon: React.ElementType; label: string }[] = [
  { id: 'details', icon: FileText, label: 'Detalhes' },
  { id: 'orders', icon: Wrench, label: 'Ordens' },
  { id: 'attachments', icon: Paperclip, label: 'Anexos' }, // Mantido para anexos
  // { id: 'history', icon: History, label: 'Histórico' }, // Removido
];

const EquipmentDetailsBottomNav: React.FC<EquipmentDetailsBottomNavProps> = ({ selectedView, onSelectView }) => {
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

export default EquipmentDetailsBottomNav;