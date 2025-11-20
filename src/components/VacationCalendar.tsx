import React, { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, addMonths, subMonths, getDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Vacation } from "@/hooks/useVacations";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VacationCalendarProps {
  vacations: Vacation[];
  isLoading: boolean;
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const VacationCalendar: React.FC<VacationCalendarProps> = ({ vacations, isLoading }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfCurrentMonth = startOfMonth(currentDate);
  const endOfCurrentMonth = endOfMonth(currentDate);

  const daysInMonth = useMemo(() => {
    const startDay = getDay(startOfCurrentMonth); // 0 for Sunday, 1 for Monday, etc.
    const days = eachDayOfInterval({ start: startOfCurrentMonth, end: endOfCurrentMonth });
    
    // Add leading empty days for alignment
    const leadingEmptyDays = Array.from({ length: startDay }, (_, i) => null);
    
    return [...leadingEmptyDays, ...days];
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
        <div className="grid grid-cols-7 gap-1">
          {isLoading ? (
            Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-20 w-full bg-muted rounded-md animate-pulse"></div>
            ))
          ) : (
            daysInMonth.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-20"></div>;
              }
              const dayVacations = getVacationsForDay(day);
              const isCurrentDay = isToday(day);

              return (
                <Popover key={format(day, "yyyy-MM-dd")}>
                  <PopoverTrigger asChild>
                    <div
                      className={cn(
                        "h-20 w-full flex flex-col items-center p-1 rounded-md cursor-pointer transition-colors",
                        "hover:bg-muted/50",
                        isCurrentDay && "bg-primary/10 border border-primary",
                        dayVacations.length > 0 && "bg-blue-100 dark:bg-blue-900/20"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-semibold",
                        isCurrentDay && "text-primary",
                        dayVacations.length > 0 && "text-blue-800 dark:text-blue-200"
                      )}>
                        {format(day, "d")}
                      </span>
                      <div className="flex flex-wrap justify-center gap-0.5 mt-1 max-h-12 overflow-hidden">
                        {dayVacations.map((vac, i) => (
                          <span key={vac.id + i} className="text-xs font-medium bg-blue-500 text-white px-1 rounded-sm leading-tight">
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
                            <li key={vac.id} className="text-sm">
                              <p className="font-medium">{vac.user_full_name}</p>
                              <p className="text-muted-foreground text-xs">
                                {format(new Date(vac.start_date), "dd/MM/yyyy", { locale: ptBR })} -{" "}
                                {format(new Date(vac.end_date), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                              {vac.notes && <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">{vac.notes}</p>}
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
      </CardContent>
    </Card>
  );
};

export default VacationCalendar;