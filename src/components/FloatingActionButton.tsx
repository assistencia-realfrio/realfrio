import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react'; // Revertido para PlusCircle
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
        // Aumentado o tamanho do botão para h-16 w-16
        "fixed bottom-4 right-4 z-50 rounded-full h-16 w-16 p-0 shadow-lg",
        "flex items-center justify-center text-white bg-primary hover:bg-primary/90",
        className
      )}
      aria-label={label}
    >
      {/* Aumentado o tamanho do ícone para h-14 w-14 para preencher o botão maior */}
      {Icon ? <Icon className="h-14 w-14" /> : <PlusCircle className="h-14 w-14" />}
      <span className="sr-only">{label}</span> {/* Apenas para acessibilidade */}
    </Button>
  );
};

export default FloatingActionButton;