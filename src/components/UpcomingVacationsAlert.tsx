import React, { useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Vacation } from "@/hooks/useVacations";
import { format, startOfWeek, endOfWeek, addWeeks, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface UpcomingVacationsAlertProps {
  vacations: Vacation[];
  isLoading: boolean;
}

const UpcomingVacationsAlert: React.FC<UpcomingVacationsAlertProps> = ({ vacations, isLoading }) => {
  // Calcula as datas da próxima semana uma vez por renderização, se não estiver carregando
  const { startOfNextWeek, endOfOfNextWeek } = useMemo(() => {
    if (isLoading) {
      return { startOfNextWeek: null, endOfOfNextWeek: null };
    }
    const today = new Date();
    // ALTERADO: weekStartsOn para 1 (segunda-feira)
    const localeOptions = { locale: ptBR, weekStartsOn: 1 as 0 | 1 | 2 | 3 | 4 | 5 | 6 }; 
    const s = startOfWeek(addWeeks(today, 1), localeOptions);
    const e = endOfWeek(addWeeks(today, 1), localeOptions);
    return { startOfNextWeek: s, endOfOfNextWeek: e };
  }, [isLoading]); // Depende apenas de isLoading

  const groupedVacations = useMemo(() => {
    if (isLoading || !vacations || !startOfNextWeek || !endOfOfNextWeek) {
        return new Map<string, { name: string, periods: { start: string, end: string }[] }>();
    }

    const grouped = new Map<string, { name: string, periods: { start: string, end: string }[] }>();

    vacations.forEach(vac => {
        const vacStartDate = parseISO(vac.start_date);
        const vacEndDate = parseISO(vac.end_date);

        // Considera apenas férias pendentes ou aprovadas
        if (vac.status === 'rejected') return;

        // Uma férias é "na próxima semana" se:
        // 1. A data de início da férias está dentro da próxima semana
        // 2. A data de fim da férias está dentro da próxima semana
        // 3. A próxima semana está completamente contida dentro do período de férias
        const overlaps = 
            isWithinInterval(vacStartDate, { start: startOfNextWeek, end: endOfOfNextWeek }) ||
            isWithinInterval(vacEndDate, { start: startOfNextWeek, end: endOfOfNextWeek }) ||
            isWithinInterval(startOfNextWeek, { start: vacStartDate, end: vacEndDate });
        
        if (overlaps) {
            const employeeId = vac.user_id;
            const employeeName = vac.user_full_name;
            const periodStart = format(vacStartDate, "dd/MM", { locale: ptBR });
            const periodEnd = format(vacEndDate, "dd/MM", { locale: ptBR });

            if (!grouped.has(employeeId)) {
                grouped.set(employeeId, { name: employeeName, periods: [] });
            }
            grouped.get(employeeId)?.periods.push({ start: periodStart, end: periodEnd });
        }
    });

    return grouped;
  }, [vacations, isLoading, startOfNextWeek, endOfOfNextWeek]);

  const displayItems = Array.from(groupedVacations.values());

  if (isLoading) {
    return <Skeleton className="h-20 w-full mb-4" />;
  }

  // Se não houver férias futuras ou as datas da próxima semana não estiverem definidas, não exibe o alerta
  if (displayItems.length === 0 || !startOfNextWeek || !endOfOfNextWeek) {
    return null;
  }

  const formattedStartDate = format(startOfNextWeek, "dd/MM", { locale: ptBR });
  const formattedEndDate = format(endOfOfNextWeek, "dd/MM", { locale: ptBR });

  return (
    <Alert className="mb-6 bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200">
      <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-200">Férias na Próxima Semana!</AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-300">
        Os seguintes colaboradores estarão de férias entre {formattedStartDate} e {formattedEndDate}:
        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            {displayItems.map((employee, index) => (
                <li key={index}>
                    <span className="font-semibold">{employee.name}:</span>{" "}
                    {employee.periods.map((p, pIdx) => (
                        <span key={pIdx}>
                            de {p.start} a {p.end}{pIdx < employee.periods.length - 1 ? '; ' : ''}
                        </span>
                    ))}
                </li>
            ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default UpcomingVacationsAlert;