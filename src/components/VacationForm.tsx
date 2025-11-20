import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Vacation } from "@/hooks/useVacations";
import { DateRange } from "react-day-picker"; // Importar DateRange

// NOVO: Tipo para os valores do formulário com DateRange
export interface VacationFormValues {
  dateRange: DateRange;
  notes?: string;
}

// NOVO: Esquema de validação para o intervalo de datas
const vacationFormSchema = z.object({
  dateRange: z.object({
    from: z.date({ required_error: "A data de início é obrigatória." }),
    to: z.date({ required_error: "A data de fim é obrigatória." }),
  }, { required_error: "Selecione o período de férias." }),
  notes: z.string().max(500, { message: "As notas não podem exceder 500 caracteres." }).optional(),
}).refine((data) => data.dateRange.to && data.dateRange.from && data.dateRange.to >= data.dateRange.from, {
  message: "A data de fim não pode ser anterior à data de início.",
  path: ["dateRange.to"],
});

interface VacationFormProps {
  initialData?: Vacation;
  onSubmit: (data: VacationFormValues) => void | Promise<void>; // CORRIGIDO: Permitir Promise<void>
  onCancel: () => void;
  isPending: boolean;
}

const VacationForm: React.FC<VacationFormProps> = ({ initialData, onSubmit, onCancel, isPending }) => {
  const form = useForm<VacationFormValues>({
    resolver: zodResolver(vacationFormSchema),
    defaultValues: initialData ? {
      dateRange: {
        from: new Date(initialData.start_date),
        to: new Date(initialData.end_date),
      },
      notes: initialData.notes || "",
    } : {
      dateRange: {}, // Inicializa como objeto vazio para o seletor de intervalo
      notes: "",
    },
  });

  const handleSubmit = (data: VacationFormValues) => {
    onSubmit(data);
  };

  const dateRange = form.watch("dateRange"); // Observa o intervalo de datas

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Período de Férias *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange?.from && "text-muted-foreground"
                      )}
                      disabled={isPending}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                            {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                        )
                      ) : (
                        <span>Selecione o período de férias</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range" // Modo de seleção de intervalo
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={field.onChange}
                    numberOfMonths={2} // Mostra dois meses para facilitar a seleção de intervalo
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Adicione quaisquer notas relevantes..." {...field} rows={3} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "A enviar..." : (initialData ? "Salvar Alterações" : "Solicitar Férias")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default VacationForm;