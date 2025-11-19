import React from "react";
import { useFormContext } from "react-hook-form";
import { CalendarIcon, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ServiceOrderFormValues } from "./ServiceOrderForm"; // Importar o tipo do formulário

// Função para gerar intervalos de tempo de 30 minutos, das 08:00 às 18:00
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let h = 8; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 18 && m > 0) continue;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

const ServiceOrderScheduleCard: React.FC = () => {
  const form = useFormContext<ServiceOrderFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Agendamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name="scheduled_date"
            render={({ field }) => (
              <FormItem className="flex flex-col col-span-2">
                <FormLabel>Data de Agendamento (Opcional)</FormLabel>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  {field.value && (
                    <Button type="button" variant="outline" size="icon" onClick={() => field.onChange(null)}>
                      <XCircle className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduled_time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Hora (Opcional)</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "NONE_SELECTED" ? null : value)}
                  value={field.value || "NONE_SELECTED"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a hora" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NONE_SELECTED">Nenhuma Hora</SelectItem>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceOrderScheduleCard;