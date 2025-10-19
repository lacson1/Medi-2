import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ChevronDown,
  Loader2,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestionItem {
  label?: string;
  value?: string;
  name?: string;
  text?: string;
  category?: string;
  description?: string;
}

interface AutoCompleteProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (suggestion: SuggestionItem | string) => void;
  suggestions?: (SuggestionItem | string)[];
  isLoading?: boolean;
  allowCustom?: boolean;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string | null;
  showSuggestions?: boolean;
  maxSuggestions?: number;
  minLength?: number;
  debounceMs?: number;
  renderSuggestion?: (suggestion: SuggestionItem | string, index: number, isHighlighted: boolean) => React.ReactNode;
  onAddNew?: (value: string) => void;
  id?: string;
}

export default function AutoComplete({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  suggestions = [],
  isLoading = false,
  allowCustom = true,
  className = "",
  disabled = false,
  required = false,
  error = null,
  showSuggestions = true,
  maxSuggestions = 10,
  minLength = 1,
  debounceMs = 300,
  renderSuggestion = undefined,
  onAddNew = undefined,
  id,
  ...props
}: AutoCompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value || '');
  const [debouncedValue, setDebouncedValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce input changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, debounceMs]);

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter(suggestion => {
    if (!debouncedValue || debouncedValue.length < minLength) return false;
    const searchTerm = debouncedValue.toLowerCase();
    const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.label || suggestion.name || suggestion.text || '';
    return suggestionText.toLowerCase().includes(searchTerm);
  }).slice(0, maxSuggestions);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHighlightedIndex(-1);
    setIsOpen(true);

    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSuggestionClick = (suggestion: SuggestionItem | string) => {
    const suggestionValue = typeof suggestion === 'string' ? suggestion : suggestion.value || suggestion.label || suggestion.name || suggestion.text || '';
    setInputValue(suggestionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onSelect) {
      onSelect(suggestion);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
          const suggestion = filteredSuggestions[highlightedIndex];
          if (suggestion) {
            handleSuggestionClick(suggestion);
          }
        } else if (allowCustom && inputValue.trim()) {
          handleSuggestionClick(inputValue.trim());
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay closing to allow clicks on suggestions
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  const handleFocus = () => {
    if (inputValue.length >= minLength) {
      setIsOpen(true);
    }
  };

  const clearInput = () => {
    setInputValue('');
    setHighlightedIndex(-1);
    setIsOpen(false);
    if (onChange) {
      onChange('');
    }
  };

  const renderSuggestionItem = (suggestion: SuggestionItem | string, index: number) => {
    if (renderSuggestion) {
      return renderSuggestion(suggestion, index, highlightedIndex === index);
    }

    const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.label || suggestion.name || suggestion.text || '';
    const isHighlighted = highlightedIndex === index;

    return (
      <div
        key={index}
        className={cn(
          "flex items-center justify-between px-3 py-2 cursor-pointer transition-colors",
          isHighlighted ? "bg-blue-50 text-blue-900" : "hover:bg-gray-50"
        )}
        onClick={() => handleSuggestionClick(suggestion)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{suggestionText}</span>
          {typeof suggestion === 'object' && suggestion.category && (
            <Badge variant="outline" className="text-xs">
              {suggestion.category}
            </Badge>
          )}
        </div>
        {typeof suggestion === 'object' && suggestion.description && (
          <span className="text-xs text-gray-500 truncate max-w-32">
            {suggestion.description}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={cn("relative", className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1 block">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          id={id}
          className={cn(
            "pr-20",
            error && "border-red-500 focus:border-red-500",
            isOpen && "rounded-b-none"
          )}
          {...props}
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          )}
          
          {inputValue && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-200"
              onClick={clearInput}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          
          <div className="w-px h-4 bg-gray-300" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-200"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}

      {isOpen && showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div ref={listRef}>
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion, index) => renderSuggestionItem(suggestion, index))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                {debouncedValue.length < minLength ? (
                  `Type at least ${minLength} character${minLength > 1 ? 's' : ''} to see suggestions`
                ) : (
                  <div className="flex items-center justify-between">
                    <span>No suggestions found</span>
                    {allowCustom && debouncedValue.trim() && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleSuggestionClick(debouncedValue.trim())}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add "{debouncedValue.trim()}"
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {allowCustom && debouncedValue.trim() && filteredSuggestions.length > 0 && (
              <div className="border-t border-gray-200 p-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-blue-600 hover:text-blue-700"
                  onClick={() => {
                    handleSuggestionClick(debouncedValue.trim());
                    if (onAddNew) {
                      onAddNew(debouncedValue.trim());
                    }
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add "{debouncedValue.trim()}"
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
