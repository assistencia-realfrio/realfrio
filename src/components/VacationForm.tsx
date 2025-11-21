import React, { useMemo } from "react"; // Adicionado useMemo
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CalendarIcon, Check, User } from "lucide-react";
import { format, eachDayOfInterval, isWeekend } from "date-fns"; // Adicionado eachDayOfInterval, isWeekend
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Vacation, VacationFormValues } from "@/hooks/useVacations";
import { Profile } from "@/hooks/useProfile"; // Importar Profile
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const vacationFormSchema = z.object({
  user_id: z.string().uuid({ message: "Selecione um colaborador válido." }).optional(), // NOVO: Campo para selecionar o utilizador
  start_date: z.date({ required_error: "A data de início é obrigatória." }),
  end_date: z.date({ required_error: "A data de fim é obrigatória." }),
  notes: z.string().max(500, { message: "As notas não podem exceder 500 caracteres." }).optional(),
}).refine((data) => data.end_date >= data.start_date, {
  message: "A data de fim não pode ser anterior à data de início.",
  path: ["end_date"],
});

interface VacationFormProps {
  initialData?: Vacation;
  onSubmit: (data: VacationFormValues & { userIdForRequest?: string }) => void; // Modificado para incluir userIdForRequest
  onCancel: () => void;
  isPending: boolean;
  allProfiles: Profile[]; // NOVO: Prop para todos os perfis
  currentUserId: string; // NOVO: Prop para o ID do utilizador atual
}

// Helper function to calculate working days
const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter(day => !isWeekend(day)).length;
};

const VacationForm: React.FC<VacationFormProps> = ({ initialData, onSubmit, onCancel, isPending, allProfiles, currentUserId }) => {
  const form = useForm<VacationFormValues & { user_id?: string }>({ // Adicionado user_id ao tipo do useForm
    resolver: zodResolver(vacationFormSchema),
    defaultValues: initialData ? {
      user_id: initialData.user_id, // Preenche com o user_id da férias existente
      start_date: new Date(initialData.start_date),
      end_date: new Date(initialData.end_date),
      notes: initialData.notes || "",
    } : {
      user_id: currentUserId, // Padrão para o utilizador atual ao criar
      start_date: undefined,
      end_date: undefined,
      notes: "",
    },
  });

  const handleSubmit = (data: VacationFormValues & { user_id?: string }) => {
    onSubmit({
      start_date: data.start_date,
      end_date: data.end_date,
      notes: data.notes,
      userIdForRequest: data.user_id, // Passa o user_id selecionado
    });
  };

  const startDate = form.watch("start_date"); // Observa a data de início
  const endDate = form.watch("end_date"); // Observa a data de fim
  const selectedUserId = form.watch("user_id");

  const selectedProfile = allProfiles.find(p => p.id === selectedUserId);
  const displayUserName = selectedProfile 
    ? `${selectedProfile.first_name || ''} ${selectedProfile.last_name || ''}`.trim() || selectedProfile.id
    : "Selecione um colaborador";

  // Calcula os dias úteis dinamicamente
  const calculatedWorkingDays = useMemo(() => {
    if (startDate && endDate && endDate >= startDate) {
      return calculateWorkingDays(startDate, endDate);
    }
    return 0;
  }, [startDate, endDate]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* NOVO: Campo de seleção de colaborador */}
        <FormField
          control={form.control}
          name="user_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Colaborador *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isPending || !!initialData} // Desabilita se estiver editando uma férias existente
                    >
                      {displayUserName}
                      <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar colaborador..." />
                    <CommandList>
                      <CommandEmpty>Nenhum colaborador encontrado.</CommandEmpty>
                      <CommandGroup>
                        {allProfiles.map((profile) => (
                          <CommandItem
                            value={`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.id}
                            key={profile.id}
                            onSelect={() => {
                              form.setValue("user_id", profile.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                profile.id === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.id}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Início *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isPending}
                    >
                      {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data de início"}
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Fim *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isPending}
                    >
                      {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data de fim"}
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
                    fromDate={startDate || undefined} // NOVO: Define a data mínima selecionável
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* NOVO: Exibição de Dias Úteis Calculados */}
        {(startDate && endDate && endDate >= startDate) && (
          <FormItem>
            <FormLabel>Dias Úteis</FormLabel>
            <FormControl>
              <Input value={calculatedWorkingDays} readOnly className="font-bold" />
            </FormControl>
          </FormItem>
        )}

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