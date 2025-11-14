import React from 'react';
import { FileText, Paperclip, History, List, HardDrive, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge'; // NOVO: Importar Badge

type View = 'details' | 'attachments' | 'equipment' | 'activity' | 'notes';

interface ServiceOrderBottomNavProps {
  selectedView: View;
  onSelectView: (view: View) => void;
  canAccessTabs: boolean;
  notesCount: number; // NOVO: Contagem de notas
  attachmentsCount: number; // NOVO: Contagem de anexos
}

const navItems: { id: View; icon: React.ElementType; label: string; getCount?: (props: ServiceOrderBottomNavProps) => number }[] = [
  { id: 'details', icon: FileText, label: 'Detalhes' },
  { id: 'notes', icon: MessageSquareText, label: 'Notas', getCount: (props) => props.notesCount }, // Adicionado getCount
  { id: 'attachments', icon: Paperclip, label: 'Anexos', getCount: (props) => props.attachmentsCount }, // Adicionado getCount
  { id: 'equipment', icon: HardDrive, label: 'Equipamento' },
  { id: 'activity', icon: List, label: 'Atividade' },
];

const ServiceOrderBottomNav: React.FC<ServiceOrderBottomNavProps> = ({ selectedView, onSelectView, canAccessTabs, notesCount, attachmentsCount }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 lg:left-64">
      <div className="flex justify-around items-center h-16 gap-1 px-2">
        {navItems.map((item) => {
          const count = item.getCount ? item.getCount({ selectedView, onSelectView, canAccessTabs, notesCount, attachmentsCount }) : 0;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "flex flex-col items-center justify-center h-14 flex-1 rounded-lg p-1 text-center relative", // Adicionado relative
                selectedView === item.id ? 'bg-muted text-primary' : 'text-muted-foreground',
              )}
              onClick={() => onSelectView(item.id)}
              disabled={!canAccessTabs && item.id !== 'details'}
              aria-label={item.label}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.label}</span>
              {count > 0 && ( // Exibir Badge apenas se a contagem for maior que 0
                <Badge 
                  variant="destructive" 
                  className="absolute top-1 right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceOrderBottomNav;