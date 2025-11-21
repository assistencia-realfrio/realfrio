import React, { useState, useMemo, useRef } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, addMonths, subMonths, getDay, isToday, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Vacation } from "@/hooks/useVacations";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Profile } from "@/hooks/useProfile"; // Importar Profile

interface VacationCalendarProps {
  vacations: Vacation[];
  isLoading: boolean;
  allProfiles: Profile[]; // NOVO: Recebe todos os perfis
}

const dayNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]; // ALTERADO: Ordem dos dias da semana

// Função para gerar uma cor HSL aleatória e convertê-la para string CSS
const generateRandomColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * (70 - 40) + 40); // 40-70% saturation
  const lightness = Math.floor(Math.random() * (60 - 30) + 30); // 30-60% lightness for darker colors
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const VacationCalendar: React.FC<VacationCalendarProps> = ({ vacations, isLoading, allProfiles }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  // Usar useRef para armazenar as cores dos utilizadores e garantir consistência
  const userColors = useRef<Map<string, string>>(new Map());

  // Gerar cores para cada utilizador uma única vez
  useMemo(() => {
    allProfiles.forEach(profile => {
      if (!userColors.current.has(profile.id)) {
        userColors.current.set(profile.id, generateRandomColor());
      }
    });
  }, [allProfiles]);

  const startOfCurrentMonth = startOfMonth(currentDate);
  const endOfCurrentMonth = endOfMonth(currentDate);

  const daysInMonth = useMemo(() => {
    // ALTERADO: Calcular o primeiro e último dia da grelha para começar na segunda-feira
    const firstDayOfGrid = startOfWeek(startOfCurrentMonth, { weekStartsOn: 1, locale: ptBR });
    const lastDayOfGrid = endOfWeek(endOfCurrentMonth, { weekStartsOn: 1, locale: ptBR });
    
    return eachDayOfInterval({ start: firstDayOfGrid, end: lastDayOfGrid });
  }, [startOfCurrentMonth, endOfCurrentMonth]);

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const getVacationsForDay = (day: Date) => {
    return vacations.filter(vac => {
      const startDate = new Date(vac.start_date);
      const endDate = new Date(vac.end_date);
      return isSameDay(day, startDate) || isSameDay(day, endDate) || isWithinInterval(day, { start: startDate, end: endDate });
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Button variant="ghost" size="icon" onClick={handlePreviousMonth} aria-label="Mês Anterior">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <CardTitle className="text-xl font-bold">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={handleNextMonth} aria-label="Próximo Mês">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-7 text-center text-sm font-medium text-muted-foreground mb-2">
          {dayNames.map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-border border border-border rounded-md overflow-hidden"> {/* Adicionado bg-border e border para a grelha */}
          {isLoading ? (
            Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-20 w-full bg-muted rounded-md animate-pulse"></div>
            ))
          ) : (
            daysInMonth.map((day, index) => {
              // Removido o check para `!day` pois `eachDayOfInterval` agora retorna todos os dias
              const dayVacations = getVacationsForDay(day);
              const isCurrentDay = isToday(day);
              const isWeekend = getDay(day) === 0 || getDay(day) === 6; // 0 = Domingo, 6 = Sábado

              return (
                <Popover key={format(day, "yyyy-MM-dd")}>
                  <PopoverTrigger asChild>
                    <div
                      className={cn(
                        "h-20 w-full flex flex-col items-center p-1 transition-colors",
                        isWeekend ? "bg-muted" : "bg-background", // Fundo mais escuro para fins de semana
                        "hover:bg-muted/50",
                        isCurrentDay && "bg-primary/10 border border-primary",
                      )}
                    >
                      <span className={cn(
                        "text-sm font-semibold",
                        isCurrentDay && "text-primary",
                        dayVacations.length > 0 && "text-foreground"
                      )}>
                        {format(day, "d")}
                      </span>
                      <div className="flex flex-wrap justify-center gap-0.5 mt-1 max-h-12 overflow-hidden">
                        {dayVacations.map((vac, i) => (
                          <span 
                            key={vac.id + i} 
                            className="text-xs font-medium text-white px-1 rounded-sm leading-tight"
                            style={{ backgroundColor: userColors.current.get(vac.user_id) || '#9ca3af' }}
                          >
                            {vac.user_initials}
                          </span>
                        ))}
                        {dayVacations.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{dayVacations.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </PopoverTrigger>
                  {dayVacations.length > 0 && (
                    <PopoverContent className="w-80 p-4">
                      <h4 className="font-semibold text-lg mb-2">Férias em {format(day, "dd/MM/yyyy", { locale: ptBR })}</h4>
                      <ScrollArea className="h-48">
                        <ul className="space-y-3 pr-4">
                          {dayVacations.map(vac => (
                            <li key={vac.id} className="text-sm flex items-center gap-2">
                              <span 
                                className="h-3 w-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: userColors.current.get(vac.user_id) || '#9ca3af' }}
                              ></span>
                              <div>
                                <p className="font-medium">{vac.user_full_name}</p>
                                <p className="text-muted-foreground text-xs">
                                  {format(new Date(vac.start_date), "dd/MM/yyyy", { locale: ptBR })} -{" "}
                                  {format(new Date(vac.end_date), "dd/MM/yyyy", { locale: ptBR })}
                                  <span className="ml-2 font-semibold">({vac.working_days_count} dias úteis)</span> {/* NOVO: Exibe dias úteis */}
                                </p>
                                {vac.notes && <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">{vac.notes}</p>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </PopoverContent>
                  )}
                </Popover>
              );
            })
          )}
        </div>

        {/* NOVO: Legenda de Cores */}
        {!isLoading && allProfiles.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-semibold text-md mb-3">Legenda de Colaboradores:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
              {allProfiles.map(profile => (
                <div key={profile.id} className="flex items-center gap-2 text-sm">
                  <span 
                    className="h-4 w-4 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: userColors.current.get(profile.id) || '#9ca3af' }}
                  ></span>
                  <span className="truncate">
                    {`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VacationCalendar;