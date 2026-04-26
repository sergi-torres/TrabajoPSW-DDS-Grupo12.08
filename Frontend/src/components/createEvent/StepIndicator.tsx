import { Check } from "lucide-react";

interface Step {
    number: number;
    label: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
    return (
        <div className="w-full max-w-2xl mx-auto px-4">
            <div className="relative flex items-center justify-between">
                {/* Background Line */}
                <div className="absolute top-6 left-0 w-full h-[2px] bg-muted -translate-y-1/2 z-0" />
                
                {/* Progress Line */}
                <div 
                    className="absolute top-6 left-0 h-[2px] bg-org -translate-y-1/2 z-0 transition-all duration-500"
                    style={{ 
                        width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
                    }}
                />

                {steps.map((step) => {
                    const isCompleted = currentStep > step.number;
                    const isActive = currentStep === step.number;

                    return (
                        <div key={step.number} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`
                                    w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg font-heading font-bold
                                    transition-all duration-300 shadow-sm
                                    ${isCompleted
                                        ? "bg-org text-white"
                                        : isActive
                                            ? "border-2 border-org text-org bg-white shadow-md scale-110"
                                            : "border-2 border-muted text-muted-foreground bg-white"
                                    }
                                `}
                            >
                                {isCompleted ? <Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} /> : step.number}
                            </div>
                            
                            <div className="absolute top-12 sm:top-14 w-max max-w-[80px] sm:max-w-[120px] text-center">
                                <span
                                    className={`
                                        block text-[10px] sm:text-xs font-heading font-bold uppercase tracking-wider mt-1
                                        ${isActive || isCompleted ? "text-org" : "text-muted-foreground"}
                                        ${isActive ? "opacity-100" : "opacity-70"}
                                    `}
                                >
                                    {step.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Spacer for the absolute labels */}
            <div className="h-12 sm:h-16" />
        </div>
    );
};

export default StepIndicator;
