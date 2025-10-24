import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type WizardStep = "upload" | "mapping" | "configure" | "review";

interface WizardProgressProps {
  currentStep: WizardStep;
}

const STEPS = [
  { id: "upload", label: "Upload", description: "Carregar arquivo" },
  { id: "mapping", label: "Mapeamento", description: "Mapear colunas" },
  { id: "configure", label: "Configuração", description: "Regras ABC" },
  { id: "review", label: "Revisão", description: "Confirmar dados" },
];

export const WizardProgress = ({ currentStep }: WizardProgressProps) => {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={step.id} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "border-primary text-primary",
                    isUpcoming && "border-muted-foreground/25 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      (isCompleted || isCurrent) && "text-foreground",
                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-[2px] flex-1 mx-2 transition-all",
                    isCompleted && "bg-primary",
                    !isCompleted && "bg-muted-foreground/25"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
