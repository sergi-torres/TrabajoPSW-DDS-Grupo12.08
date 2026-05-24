import React from "react";
import { Search } from "lucide-react";

interface SimpleSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  inputClassName?: string;
}

export default function SimpleSearchBar({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
}: SimpleSearchBarProps) {
  return (
    <div className={`relative w-full ${className ?? ""}`}>
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10"
        size={18}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`!w-full !pl-11 !pr-4 !py-3 !bg-gray-100 !border !border-gray-300 !rounded-xl !text-gray-900 !placeholder-gray-400 focus:!bg-white focus:!border-purple-500 focus:!ring-2 focus:!ring-purple-100 !transition-all !outline-none ${inputClassName ?? ""}`}
      />
    </div>
  );
}