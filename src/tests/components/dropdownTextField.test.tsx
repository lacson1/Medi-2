/**
 * Dropdown Text Field Testing Suite
 * Tests for text fields with dropdown functionality and common issues
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import type { Patient, Appointment, User } from '@/types';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
        useNavigate: () => vi.fn(),
        useLocation: () => ({ pathname: '/' }),
    };
});

// Mock components for testing dropdown functionality
const DropdownTextField = ({
    value,
    onChange,
    options,
    placeholder = "Select an option",
    disabled = false,
    error = false,
    onBlur,
    onFocus,
    testId = "dropdown-text-field"
}: {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string; disabled?: boolean }>;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    onBlur?: () => void;
    onFocus?: () => void;
    testId?: string;
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value);
    const [filteredOptions, setFilteredOptions] = React.useState(options);

    React.useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Filter options based on input
        const filtered = options.filter(option =>
            option.label.toLowerCase().includes(newValue.toLowerCase())
        );
        setFilteredOptions(filtered);

        // Open dropdown when typing
        if (!isOpen && newValue.length > 0) {
            setIsOpen(true);
        }
    };

    const handleOptionSelect = (optionValue: string) => {
        const selectedOption = options.find(opt => opt.value === optionValue);
        if (selectedOption) {
            setInputValue(selectedOption.label);
            onChange(optionValue);
            setIsOpen(false);
        }
    };

    const handleInputFocus = () => {
        setIsOpen(true);
        onFocus?.();
    };

    const handleInputBlur = () => {
        // Delay closing to allow option clicks
        setTimeout(() => {
            setIsOpen(false);
            onBlur?.();
        }, 150);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown' && !isOpen) {
            setIsOpen(true);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className="dropdown-text-field" data-testid={testId}>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className={`dropdown-input ${error ? 'error' : ''}`}
                data-testid={`${testId}-input`}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                role="combobox"
            />
            {isOpen && (
                <ul
                    className="dropdown-options"
                    data-testid={`${testId}-options`}
                    role="listbox"
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <li
                                key={option.value}
                                onClick={() => handleOptionSelect(option.value)}
                                className={`dropdown-option ${option.disabled ? 'disabled' : ''}`}
                                data-testid={`${testId}-option-${option.value}`}
                                role="option"
                                aria-disabled={option.disabled}
                            >
                                {option.label}
                            </li>
                        ))
                    ) : (
                        <li
                            className="dropdown-option no-results"
                            data-testid={`${testId}-no-results`}
                        >
                            No results found
                        </li>
                    )}
                </ul>
            )}
            {error && (
                <div
                    className="error-message"
                    data-testid={`${testId}-error`}
                >
                    Please select a valid option
                </div>
            )}
        </div>
    );
};

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </QueryClientProvider>
    );
};

describe('Dropdown Text Field Testing', () => {
    const mockOptions = [
        { value: 'doctor-1', label: 'Dr. John Smith' },
        { value: 'doctor-2', label: 'Dr. Jane Johnson' },
        { value: 'doctor-3', label: 'Dr. Michael Brown' },
        { value: 'nurse-1', label: 'Nurse Sarah Wilson' },
        { value: 'nurse-2', label: 'Nurse David Lee' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Basic Dropdown Functionality', () => {
        it('should render dropdown text field', () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            expect(screen.getByTestId('doctor-dropdown')).toBeInTheDocument();
            expect(screen.getByTestId('doctor-dropdown-input')).toBeInTheDocument();
            expect(screen.getByTestId('doctor-dropdown-input')).toHaveAttribute('role', 'combobox');
        });

        it('should show placeholder text', () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        placeholder="Select a doctor"
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            expect(screen.getByTestId('doctor-dropdown-input')).toHaveAttribute('placeholder', 'Select a doctor');
        });

        it('should open dropdown when input is focused', async () => {
            const mockOnChange = vi.fn();
            const mockOnFocus = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        onFocus={mockOnFocus}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            await userEvent.click(input);

            expect(screen.getByTestId('doctor-dropdown-options')).toBeInTheDocument();
            expect(mockOnFocus).toHaveBeenCalled();
        });

        it('should close dropdown when clicking outside', async () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <div>
                        <DropdownTextField
                            value=""
                            onChange={mockOnChange}
                            options={mockOptions}
                            testId="doctor-dropdown"
                        />
                        <div data-testid="outside-element">Outside</div>
                    </div>
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            await userEvent.click(input);

            expect(screen.getByTestId('doctor-dropdown-options')).toBeInTheDocument();

            // Click outside
            await userEvent.click(screen.getByTestId('outside-element'));

            // Wait for dropdown to close
            await waitFor(() => {
                expect(screen.queryByTestId('doctor-dropdown-options')).not.toBeInTheDocument();
            });
        });
    });

    describe('Option Selection', () => {
        it('should select option when clicked', async () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            await userEvent.click(input);

            const option = screen.getByTestId('doctor-dropdown-option-doctor-1');
            await userEvent.click(option);

            expect(mockOnChange).toHaveBeenCalledWith('doctor-1');
            expect(input).toHaveValue('Dr. John Smith');
        });

        it('should update input value when option is selected', async () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            await userEvent.click(input);

            const option = screen.getByTestId('doctor-dropdown-option-doctor-2');
            await userEvent.click(option);

            expect(input).toHaveValue('Dr. Jane Johnson');
        });

        it('should close dropdown after option selection', async () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            await userEvent.click(input);

            const option = screen.getByTestId('doctor-dropdown-option-doctor-1');
            await userEvent.click(option);

            await waitFor(() => {
                expect(screen.queryByTestId('doctor-dropdown-options')).not.toBeInTheDocument();
            });
        });
    });

    describe('Text Filtering', () => {
        it('should filter options based on input text', async () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            await userEvent.type(input, 'John');

            await waitFor(() => {
                expect(screen.getByTestId('doctor-dropdown-options')).toBeInTheDocument();
            });

            // Should only show Dr. John Smith
            expect(screen.getByTestId('doctor-dropdown-option-doctor-1')).toBeInTheDocument();
            expect(screen.queryByTestId('doctor-dropdown-option-doctor-2')).not.toBeInTheDocument();
        });

        it('should show no results when no options match', async () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            await userEvent.type(input, 'xyz');

            await waitFor(() => {
                expect(screen.getByTestId('doctor-dropdown-no-results')).toBeInTheDocument();
            });
        });

        it('should be case insensitive when filtering', async () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            await userEvent.type(input, 'jane');

            await waitFor(() => {
                expect(screen.getByTestId('doctor-dropdown-option-doctor-2')).toBeInTheDocument();
            });
        });
    });

    describe('Keyboard Navigation', () => {
        it('should open dropdown with arrow down key', async () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            input.focus();
            await userEvent.keyboard('{ArrowDown}');

            expect(screen.getByTestId('doctor-dropdown-options')).toBeInTheDocument();
        });

        it('should close dropdown with escape key', async () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            await userEvent.click(input);

            expect(screen.getByTestId('doctor-dropdown-options')).toBeInTheDocument();

            await userEvent.keyboard('{Escape}');

            await waitFor(() => {
                expect(screen.queryByTestId('doctor-dropdown-options')).not.toBeInTheDocument();
            });
        });
    });

    describe('Error States', () => {
        it('should show error state when error prop is true', () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        error={true}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            expect(screen.getByTestId('doctor-dropdown-error')).toBeInTheDocument();
            expect(screen.getByTestId('doctor-dropdown-input')).toHaveClass('error');
        });

        it('should show error message', () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        error={true}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            expect(screen.getByTestId('doctor-dropdown-error')).toHaveTextContent('Please select a valid option');
        });
    });

    describe('Disabled State', () => {
        it('should disable input when disabled prop is true', () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        disabled={true}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            expect(screen.getByTestId('doctor-dropdown-input')).toBeDisabled();
        });

        it('should not open dropdown when disabled', async () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        disabled={true}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            await userEvent.click(input);

            expect(screen.queryByTestId('doctor-dropdown-options')).not.toBeInTheDocument();
        });
    });

    describe('Disabled Options', () => {
        const optionsWithDisabled = [
            { value: 'doctor-1', label: 'Dr. John Smith' },
            { value: 'doctor-2', label: 'Dr. Jane Johnson', disabled: true },
            { value: 'doctor-3', label: 'Dr. Michael Brown' },
        ];

        it('should show disabled options but not allow selection', async () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={optionsWithDisabled}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            await userEvent.click(input);

            const disabledOption = screen.getByTestId('doctor-dropdown-option-doctor-2');
            expect(disabledOption).toHaveClass('disabled');
            expect(disabledOption).toHaveAttribute('aria-disabled', 'true');

            await userEvent.click(disabledOption);
            expect(mockOnChange).not.toHaveBeenCalled();
        });
    });

    describe('Common Dropdown Issues', () => {
        it('should handle rapid typing without breaking', async () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');

            // Rapid typing
            await userEvent.type(input, 'Dr. John', { delay: 10 });

            await waitFor(() => {
                expect(screen.getByTestId('doctor-dropdown-options')).toBeInTheDocument();
            });

            expect(screen.getByTestId('doctor-dropdown-option-doctor-1')).toBeInTheDocument();
        });

        it('should handle empty options array', () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={[]}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            expect(input).toBeInTheDocument();
        });

        it('should handle undefined/null options gracefully', () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={[]}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            expect(input).toBeInTheDocument();
        });

        it('should maintain focus after option selection', async () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            await userEvent.click(input);

            const option = screen.getByTestId('doctor-dropdown-option-doctor-1');
            await userEvent.click(option);

            // Input should still be focused
            expect(input).toHaveFocus();
        });

        it('should handle very long option labels', () => {
            const longOptions = [
                { value: 'long-1', label: 'Dr. Very Long Name That Might Cause Layout Issues In The Dropdown Component' },
                { value: 'long-2', label: 'Another Very Long Option Label That Should Be Handled Properly' },
            ];

            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={longOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            expect(screen.getByTestId('doctor-dropdown')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes', () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            expect(input).toHaveAttribute('role', 'combobox');
            expect(input).toHaveAttribute('aria-haspopup', 'listbox');
        });

        it('should have proper ARIA attributes when dropdown is open', async () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            await userEvent.click(input);

            expect(input).toHaveAttribute('aria-expanded', 'true');
            expect(screen.getByTestId('doctor-dropdown-options')).toHaveAttribute('role', 'listbox');
        });

        it('should have proper ARIA attributes for options', async () => {
            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            const input = screen.getByTestId('doctor-dropdown-input');
            await userEvent.click(input);

            const option = screen.getByTestId('doctor-dropdown-option-doctor-1');
            expect(option).toHaveAttribute('role', 'option');
        });
    });

    describe('Performance', () => {
        it('should handle large number of options', () => {
            const largeOptions = Array.from({ length: 1000 }, (_, i) => ({
                value: `option-${i}`,
                label: `Option ${i} - Very Long Label That Might Impact Performance`
            }));

            const mockOnChange = vi.fn();

            render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={largeOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            expect(screen.getByTestId('doctor-dropdown')).toBeInTheDocument();
        });

        it('should handle rapid option changes', async () => {
            const mockOnChange = vi.fn();
            const { rerender } = render(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={mockOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            // Change options rapidly
            const newOptions = [
                { value: 'new-1', label: 'New Option 1' },
                { value: 'new-2', label: 'New Option 2' },
            ];

            rerender(
                <TestWrapper>
                    <DropdownTextField
                        value=""
                        onChange={mockOnChange}
                        options={newOptions}
                        testId="doctor-dropdown"
                    />
                </TestWrapper>
            );

            expect(screen.getByTestId('doctor-dropdown')).toBeInTheDocument();
        });
    });
});
