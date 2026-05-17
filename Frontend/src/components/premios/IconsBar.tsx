import { Award, DollarSign, Trophy, Medal, Sparkles, LucideIcon } from "lucide-react";
import { FC } from "react";

interface IconOption {
  id: string;
  label: string;
  Icon: LucideIcon;
}

interface Props {
  selectedIcon?: string;
  onSelect: (icon: string) => void;
}

const ICONS: IconOption[] = [
  { id: "trofeo", label: "Trofeo", Icon: Trophy },
  { id: "medalla", label: "Medalla", Icon: Medal },
  { id: "dinero", label: "Dinero", Icon: DollarSign },
  { id: "award", label: "Premio", Icon: Award },
  { id: "brillo", label: "Brillo", Icon: Sparkles }
];

const IconsBar: React.FC<Props> = ({ selectedIcon, onSelect }) => {
  return (
    <div className="grid grid-cols-5 gap-3">
      {ICONS.map((item) => {
        const isActive = selectedIcon === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`rounded-2xl border px-3 py-4 flex flex-col items-center justify-center gap-2 text-sm font-semibold transition-all ${isActive ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50'}`}
          >
            <item.Icon className="h-6 w-6" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default IconsBar;
