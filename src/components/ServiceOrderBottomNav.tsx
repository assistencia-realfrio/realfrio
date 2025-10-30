import React from 'react';
import { FileText, Paperclip, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type View = 'details' | 'attachments' | 'history';

interface ServiceOrderBottomNavProps {
  selectedView: View;
  onSelectView: (view: View) => void;
  canAccessTabs: boolean;
}

const navItems: { id: View; icon: React.ElementType; label: string }[] = [
  { id: 'details', icon: FileText, label: 'Detalhes' },
  { id: 'attachments', icon: Paperclip, label: 'Anexos' },
  { id: 'history', icon: History, label: 'Histórico' },
];

const ServiceOrderBottomNav: React.FC<ServiceOrderBottomNavProps> = ({ selectedView, onSelectView, canAccessTabs }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50 lg:left-64">
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
            disabled={!canAccessTabs && item.id !== 'details'}
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

export default ServiceOrderBottomNav;