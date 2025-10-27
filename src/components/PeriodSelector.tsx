import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AnalysisPeriod } from "@/types/abc";

interface PeriodSelectorProps {
  period: AnalysisPeriod;
  onChange: (period: AnalysisPeriod) => void;
}

export const PeriodSelector = ({ period, onChange }: PeriodSelectorProps) => {
  // Garantir que startDate e endDate são objetos Date
  const safeStartDate = period.startDate instanceof Date 
    ? period.startDate 
    : new Date(period.startDate);
    
  const safeEndDate = period.endDate instanceof Date 
    ? period.endDate 
    : new Date(period.endDate);

  const handleLastYear = () => {
    const now = new Date();
    onChange({
      startDate: new Date(now.getFullYear() - 1, 0, 1),
      endDate: new Date(now.getFullYear() - 1, 11, 31),
    });
  };

  const handleCurrentYear = () => {
    const now = new Date();
    onChange({
      startDate: new Date(now.getFullYear(), 0, 1),
      endDate: now,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <CardTitle>Período de Análise</CardTitle>
        </div>
        <CardDescription>
          Selecione o período para cálculo da Curva ABC
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Início</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !period.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {safeStartDate ? (
                    format(safeStartDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={safeStartDate}
                  onSelect={(date) => date && onChange({ ...period, startDate: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data Fim</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !period.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {safeEndDate ? (
                    format(safeEndDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={safeEndDate}
                  onSelect={(date) => date && onChange({ ...period, endDate: date })}
                  disabled={(date) => date < safeStartDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCurrentYear} className="flex-1">
            Ano Atual
          </Button>
          <Button variant="outline" size="sm" onClick={handleLastYear} className="flex-1">
            Ano Anterior
          </Button>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg text-sm">
          <p className="font-medium mb-1">Período Selecionado:</p>
          <p className="text-muted-foreground">
            {format(safeStartDate, "dd/MM/yyyy")} até {format(safeEndDate, "dd/MM/yyyy")}
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            ({Math.ceil((safeEndDate.getTime() - safeStartDate.getTime()) / (1000 * 60 * 60 * 24))} dias)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
