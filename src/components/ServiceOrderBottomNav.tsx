import React from 'react';
import ReactDOM from 'react-dom';
import { FileText, Paperclip, History, List, HardDrive, MessageSquareText, Dot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type View = 'details' | 'attachments' | 'activity' | 'notes';

interface ServiceOrderBottomNavProps {
  selectedView: View;
  onSelectView: (view: View) => void;
  canAccessTabs: boolean;
  notesCount: number;
  attachmentsCount: number;
}

const navItems: { id: View; icon: React.ElementType; label: string }[] = [
  { id: 'details', icon: FileText, label: 'Detalhes' },
  { id: 'notes', icon: MessageSquareText, label: 'Notas' },
  { id: 'attachments', icon: Paperclip, label: 'Anexos' },
  { id: 'activity', icon: List, label: 'Atividade' },
];

const ServiceOrderBottomNav: React.FC<ServiceOrderBottomNavProps> = ({ selectedView, onSelectView, canAccessTabs, notesCount, attachmentsCount }) => {
  
  const getHasContent = (id: View): boolean => {
    if (id === 'notes') return notesCount > 0;
    if (id === 'attachments') return attachmentsCount > 0;
    return false;
  };

  return ReactDOM.createPortal(
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 lg:left-64 top-auto">
      <div className="flex justify-around items-center h-16 gap-1 px-2">
        {navItems.map((item) => {
          const hasContent = getHasContent(item.id);
          const isDisabled = !canAccessTabs && item.id !== 'details';

          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "flex flex-col items-center justify-center h-16 flex-1 rounded-lg p-1 text-center",
                selectedView === item.id ? 'bg-muted text-primary' : 'text-muted-foreground',
              )}
              onClick={() => onSelectView(item.id)}
              disabled={isDisabled}
              aria-label={item.label}
            >
              <item.icon className="h-10 w-10" />
              <span className="text-xs mt-1 flex items-center gap-0.5">
                {item.label}
                {hasContent && (
                  <Dot className="h-6 w-6 text-destructive -ml-1" />
                )}
              </span>
            </Button>
          );
        })}
      </div>
    </div>,
    document.getElementById('bottom-nav-root') as HTMLElement
  );
};

export default ServiceOrderBottomNav;