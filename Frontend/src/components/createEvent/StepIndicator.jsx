import { Check } from "lucide-react";

const StepIndicator = ({ steps, currentStep }) => {
    return (
        <div className="flex items-center justify-center gap-0">
            {steps.map((step, index) => {
                const isCompleted = currentStep > step.number;
                const isActive = currentStep === step.number;

                return (
                    <div key={step.number} className="flex items-center">
                        <div className="flex flex-col items-center min-w-[140px]">
                            <div
                                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-lg font-heading font-semibold
                  transition-all duration-[var(--duration-normal)]
                  ${isCompleted
                                        ? "bg-org text-white"
                                        : isActive
                                            ? "border-2 border-org text-org bg-background"
                                            : "border-2 border-muted text-muted-foreground bg-background"
                                    }
                `}
                            >
                                {isCompleted ? <Check className="w-6 h-6" strokeWidth={2.5} /> : step.number}
                            </div>
              <span
                                className={`
                  mt-2 text-xs font-heading font-semibold uppercase tracking-wider
                  ${isActive || isCompleted ? "text-org" : "text-muted-foreground"}
                `}
                            >
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`
                  h-[2px] w-16 mx-2 -mt-6 transition-colors duration-[var(--duration-normal)]
                  ${currentStep > step.number + 1 || (currentStep > step.number) ? "bg-org" : "bg-muted"}
                `}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StepIndicator;
