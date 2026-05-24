// components/ui/ConfigWrench.tsx
import { Wrench, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ConfigWrenchProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function ConfigWrench({ title, children, defaultOpen = false }: ConfigWrenchProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-100 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}