import React from 'react';
import { FileText, Paperclip, History, List, HardDrive, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type View = 'details' | 'attachments' | 'equipment' | 'activity' | 'notes';

interface ServiceOrderBottomNavProps {
  selectedView: View;
  onSelectView: (view: View) => void;
  canAccessTabs: boolean;
  notesCount: number; // NOVO: Contagem de notas
  attachmentsCount: number; // NOVO: Contagem de anexos
}

const navItems: { id: View; icon: React.ElementType; label: string }[] = [
  { id: 'details', icon: FileText, label: 'Detalhes' },
  { id: 'notes', icon: MessageSquareText, label: 'Notas' },
  { id: 'attachments', icon: Paperclip, label: 'Anexos' },
  { id: 'equipment', icon: HardDrive, label: 'Equipamento' },
  { id: 'activity', icon: List, label: 'Atividade' },
];

const ServiceOrderBottomNav: React.FC<ServiceOrderBottomNavProps> = ({ selectedView, onSelectView, canAccessTabs, notesCount, attachmentsCount }) => {
  
  const getBadgeCount = (id: View): number => {
    if (id === 'notes') return notesCount;
    if (id === 'attachments') return attachmentsCount;
    return 0;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 lg:left-64">
      <div className="flex justify-around items-center h-16 gap-1 px-2">
        {navItems.map((item) => {
          const count = getBadgeCount(item.id);
          const isDisabled = !canAccessTabs && item.id !== 'details';

          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "flex flex-col items-center justify-center h-14 flex-1 rounded-lg p-1 text-center relative",
                selectedView === item.id ? 'bg-muted text-primary' : 'text-muted-foreground',
              )}
              onClick={() => onSelectView(item.id)}
              disabled={isDisabled}
              aria-label={item.label}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.label}</span>
              
              {/* Badge de Notificação */}
              {count > 0 && (
                <span className="absolute top-1 right-1.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceOrderBottomNav;