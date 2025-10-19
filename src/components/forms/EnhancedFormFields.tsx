import { useState } from 'react';
import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import AutoComplete from '@/components/ui/auto-complete';
import { getSmartSuggestions, AutocompleteItem } from '@/data/autocompleteData';

interface EnhancedInputFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helpText?: string;
  type?: 'text' | 'email' | 'tel' | 'url';
  autocompleteType?: 'specialties' | 'conditions' | 'medications' | 'symptoms' | 'allergies' | 'labTests' | 'procedures' | 'insurance' | 'addresses' | 'phoneFormats' | 'auto';
  showSuggestions?: boolean;
  maxSuggestions?: number;
  allowCustom?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (suggestion: AutocompleteItem) => void;
}

export function EnhancedInputField<T extends FieldValues>({
  name,
  label,
  placeholder,
  required,
  disabled,
  className,
  helpText,
  type = 'text',
  autocompleteType = 'auto',
  showSuggestions = true,
  maxSuggestions = 10,
  allowCustom = true,
  value,
  onChange,
}: EnhancedInputFieldProps<T>) {
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Always call useFormContext, but handle the error gracefully
  let formContext = null;
  try {
    formContext = useFormContext();
  } catch {
    // No form context available
  }

  // Get suggestions based on field name and autocomplete type
  const getFieldSuggestions = (query: string): AutocompleteItem[] => {
    if (autocompleteType === 'auto') {
      return getSmartSuggestions(name, query);
    } else {
      // Import the specific data based on autocomplete type
      const { getSuggestionsByType } = require('@/data/autocompleteData');
      return getSuggestionsByType(autocompleteType, query);
    }
  };

  const handleInputChange = (newValue: string, onChangeCallback?: (value: string) => void) => {
    if (onChangeCallback) {
      onChangeCallback(newValue);
    }

    if (showSuggestions && newValue.length > 0) {
      setIsLoading(true);
      // Simulate API delay for better UX
      setTimeout(() => {
        const newSuggestions = getFieldSuggestions(newValue);
        setSuggestions(newSuggestions);
        setIsLoading(false);
      }, 100);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion: AutocompleteItem | string, onChangeCallback?: (value: string) => void) => {
    const suggestionValue = typeof suggestion === 'string' ? suggestion : (suggestion.value || suggestion.label);
    if (onChangeCallback) {
      onChangeCallback(suggestionValue);
    }
    setSuggestions([]);
  };

  // If we have form context, use Controller
  if (formContext) {
    return (
      <Controller
        name={name}
        render={({ field, fieldState }) => {
          const hasError = !!fieldState.error;

          if (showSuggestions && suggestions.length > 0) {
            return (
              <div className="space-y-1">
                {label && (
                  <Label htmlFor={name} className="text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                )}

                <AutoComplete
                  label=""
                  placeholder={placeholder || ''}
                  value={field.value || ''}
                  onChange={(newValue) => handleInputChange(newValue, field.onChange)}
                  onSelect={(suggestion) => handleSuggestionSelect(suggestion, field.onChange)}
                  suggestions={suggestions}
                  isLoading={isLoading}
                  allowCustom={allowCustom}
                  maxSuggestions={maxSuggestions}
                  error={hasError ? fieldState.error?.message : null}
                  disabled={disabled}
                  className={cn('w-full', className)}
                />

                {helpText && (
                  <p className="text-xs text-gray-500">{helpText}</p>
                )}
              </div>
            );
          }

          // Fallback to regular input if no suggestions
          return (
            <div className="space-y-1">
              {label && (
                <Label htmlFor={name} className="text-sm font-medium text-gray-700">
                  {label}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              )}

              <Input
                {...field}
                id={name}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  'w-full',
                  hasError && 'border-red-500 focus:border-red-500',
                  className
                )}
              />

              {hasError && (
                <p className="text-sm text-red-600">{fieldState.error?.message}</p>
              )}

              {helpText && (
                <p className="text-xs text-gray-500">{helpText}</p>
              )}
            </div>
          );
        }}
      />
    );
  }

  // If no form context, use direct props
  const currentValue = value || '';
  const hasError = false; // No form validation without form context

  if (showSuggestions && suggestions.length > 0) {
    return (
      <div className="space-y-1">
        {label && (
          <Label htmlFor={name} className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        <AutoComplete
          label=""
          placeholder={placeholder || ''}
          value={currentValue}
          onChange={(newValue) => handleInputChange(newValue, onChange)}
          onSelect={(suggestion) => handleSuggestionSelect(suggestion, onChange)}
          suggestions={suggestions}
          isLoading={isLoading}
          allowCustom={allowCustom}
          maxSuggestions={maxSuggestions}
          disabled={disabled}
          className={cn('w-full', className)}
        />

        {helpText && (
          <p className="text-xs text-gray-500">{helpText}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {label && (
        <Label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        value={currentValue}
        onChange={(e) => handleInputChange(e.target.value, onChange)}
        disabled={disabled}
        className={cn(
          'w-full',
          hasError && 'border-red-500 focus:border-red-500',
          className
        )}
      />

      {helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
}

// Specialized autocomplete components for common medical fields
export function SpecialtyField<T extends FieldValues>(props: Omit<EnhancedInputFieldProps<T>, 'autocompleteType'>) {
  return <EnhancedInputField {...props} autocompleteType="specialties" />;
}

export function MedicationField<T extends FieldValues>(props: Omit<EnhancedInputFieldProps<T>, 'autocompleteType'>) {
  return <EnhancedInputField {...props} autocompleteType="medications" />;
}

export function ConditionField<T extends FieldValues>(props: Omit<EnhancedInputFieldProps<T>, 'autocompleteType'>) {
  return <EnhancedInputField {...props} autocompleteType="conditions" />;
}

export function SymptomField<T extends FieldValues>(props: Omit<EnhancedInputFieldProps<T>, 'autocompleteType'>) {
  return <EnhancedInputField {...props} autocompleteType="symptoms" />;
}

export function AllergyField<T extends FieldValues>(props: Omit<EnhancedInputFieldProps<T>, 'autocompleteType'>) {
  return <EnhancedInputField {...props} autocompleteType="allergies" />;
}

export function LabTestField<T extends FieldValues>(props: Omit<EnhancedInputFieldProps<T>, 'autocompleteType'>) {
  return <EnhancedInputField {...props} autocompleteType="labTests" />;
}

export function InsuranceField<T extends FieldValues>(props: Omit<EnhancedInputFieldProps<T>, 'autocompleteType'>) {
  return <EnhancedInputField {...props} autocompleteType="insurance" />;
}
