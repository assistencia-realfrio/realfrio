import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react'; // Alterado de PlusCircle para Plus
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  label: string;
  icon?: React.ElementType;
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick, label, icon: Icon, className }) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-4 right-4 z-50 rounded-full h-14 w-14 p-0 shadow-lg",
        "flex items-center justify-center text-white bg-primary hover:bg-primary/90",
        className
      )}
      aria-label={label}
    >
      {/* Usando o ícone Plus (sinal de adição) e definindo um tamanho grande */}
      {Icon ? <Icon className="h-10 w-10" /> : <Plus className="h-10 w-10" />}
      <span className="sr-only">{label}</span> {/* Apenas para acessibilidade */}
    </Button>
  );
};

export default FloatingActionButton;