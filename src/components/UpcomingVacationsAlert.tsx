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
  const { startOfNextWeek, endOfNextWeek } = useMemo(() => {
    if (isLoading) {
      return { startOfNextWeek: null, endOfNextWeek: null };
    }
    const today = new Date();
    const localeOptions = { locale: ptBR, weekStartsOn: 0 as 0 | 1 | 2 | 3 | 4 | 5 | 6 };
    const s = startOfWeek(addWeeks(today, 1), localeOptions);
    const e = endOfWeek(addWeeks(today, 1), localeOptions);
    return { startOfNextWeek: s, endOfNextWeek: e };
  }, [isLoading]); // Depende apenas de isLoading

  const upcomingVacations = useMemo(() => {
    // Se estiver carregando ou as datas da próxima semana não estiverem prontas, retorna vazio
    if (isLoading || !vacations || !startOfNextWeek || !endOfNextWeek) {
      return [];
    }

    return vacations.filter(vac => {
      const vacStartDate = parseISO(vac.start_date);
      const vacEndDate = parseISO(vac.end_date);

      // Considera apenas férias pendentes ou aprovadas
      if (vac.status === 'rejected') return false;

      // Uma férias é "na próxima semana" se:
      // 1. A data de início da férias está dentro da próxima semana
      // 2. A data de fim da férias está dentro da próxima semana
      // 3. A próxima semana está completamente contida dentro do período de férias
      const overlaps = 
        isWithinInterval(vacStartDate, { start: startOfNextWeek, end: endOfNextWeek }) ||
        isWithinInterval(vacEndDate, { start: startOfNextWeek, end: endOfNextWeek }) ||
        isWithinInterval(startOfNextWeek, { start: vacStartDate, end: vacEndDate });
      
      return overlaps;
    });
  }, [vacations, isLoading, startOfNextWeek, endOfNextWeek]); // Agora depende dessas datas

  if (isLoading) {
    return <Skeleton className="h-20 w-full mb-4" />;
  }

  // Se não houver férias futuras ou as datas da próxima semana não estiverem definidas, não exibe o alerta
  if (upcomingVacations.length === 0 || !startOfNextWeek || !endOfNextWeek) {
    return null;
  }

  const employeeNames = upcomingVacations
    .map(vac => vac.user_full_name)
    .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicatas
    .join(", ");

  const formattedStartDate = format(startOfNextWeek, "dd/MM", { locale: ptBR });
  const formattedEndDate = format(endOfNextWeek, "dd/MM", { locale: ptBR });

  return (
    <Alert className="mb-6 bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200">
      <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-200">Férias na Próxima Semana!</AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-300">
        Os seguintes colaboradores estarão de férias entre {formattedStartDate} e {formattedEndDate}:{" "}
        <span className="font-semibold">{employeeNames}</span>.
      </AlertDescription>
    </Alert>
  );
};

export default UpcomingVacationsAlert;