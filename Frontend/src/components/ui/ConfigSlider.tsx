import { Settings2 } from "lucide-react";

interface ConfigSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  icon?: React.ReactNode;
  onChange: (value: number) => void;
}

export function ConfigSlider({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  unit = "", 
  icon,
  onChange 
}: ConfigSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon || <Settings2 className="w-4 h-4 text-gray-500" />}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-bold text-purple-600">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}