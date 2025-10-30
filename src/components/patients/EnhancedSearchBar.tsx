import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface EnhancedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function EnhancedSearchBar({
  value,
  onChange,
  placeholder = "Search patients by name, email, phone, or address...",
}: EnhancedSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative flex-1">
      <Search
        className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
          isFocused ? "text-blue-600" : "text-gray-400"
        }`}
      />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all ${
          isFocused ? "shadow-sm" : ""
        }`}
        aria-label="Search patients"
        role="searchbox"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}

