import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  X,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  renderSuggestion = null,
  onAddNew = null,
  onEdit = null,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value || '');
  const [debouncedValue, setDebouncedValue] = useState(value || '');
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const debounceRef = useRef(null);

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
    const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.label || suggestion.name || suggestion.text;
    return suggestionText.toLowerCase().includes(searchTerm);
  }).slice(0, maxSuggestions);

  const handleInputChange = (e: React.FormEvent) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHighlightedIndex(-1);
    setIsOpen(true);

    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    const suggestionValue = typeof suggestion === 'string' ? suggestion : suggestion.value || suggestion.label || suggestion.name || suggestion.text;
    setInputValue(suggestionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onSelect) {
      onSelect(suggestion);
    }
  };

  const handleKeyDown = (e: React.FormEvent) => {
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
          handleSuggestionClick(filteredSuggestions[highlightedIndex]);
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

  const handleBlur = (e: React.FormEvent) => {
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
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onChange) {
      onChange('');
    }
    inputRef.current?.focus();
  };

  const renderSuggestionItem = (suggestion: any, index: any) => {
    if (renderSuggestion) {
      return renderSuggestion(suggestion, index, highlightedIndex === index);
    }

    const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.label || suggestion.name || suggestion.text;
    const suggestionValue = typeof suggestion === 'string' ? suggestion : suggestion.value || suggestion.label || suggestion.name || suggestion.text;
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
          {suggestion.category && (
            <Badge variant="outline" className="text-xs">
              {suggestion.category}
            </Badge>
          )}
        </div>
        {suggestion.description && (
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
        <Label htmlFor={props.id} className="text-sm font-medium text-gray-700 mb-1 block">
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
          {filteredSuggestions.length > 0 ? (
            <div ref={listRef}>
              {filteredSuggestions.map((suggestion, index) =>
                renderSuggestionItem(suggestion, index)
              )}
            </div>
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
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
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

          {onAddNew && (
            <div className="border-t border-gray-200 p-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => {
                  setIsOpen(false);
                  onAddNew(inputValue);
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add New
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
