import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, XCircle } from "lucide-react"; // Importado XCircle para o botão de limpar
import { ptBR } from 'date-fns/locale';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator"; // Importado Separator

interface DatePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ date, setDate, placeholder = "Selecione a data", disabled = false }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: ptBR }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          locale={ptBR}
        />
        {date && ( // Mostra o botão de limpar apenas se uma data estiver selecionada
          <>
            <Separator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                onClick={() => setDate(undefined)} 
                className="w-full text-destructive hover:text-destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Limpar Data
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;