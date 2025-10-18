/**
 * Type-safe tests for Select component
 */

import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

describe('Select Component', () => {
    it('renders Select with default props', () => {
        render(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                </SelectContent>
            </Select>
        );

        const trigger = screen.getByRole('combobox');
        expect(trigger).toBeInTheDocument();
        expect(trigger).toHaveClass('flex', 'h-9', 'w-full');
    });

    it('renders with placeholder', () => {
        render(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                </SelectContent>
            </Select>
        );

        expect(screen.getByText('Choose an option')).toBeInTheDocument();
    });

    it('opens dropdown when clicked', async () => {
        const user = userEvent.setup();

        render(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                </SelectContent>
            </Select>
        );

        const trigger = screen.getByRole('combobox');
        await user.click(trigger);

        await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument();
            expect(screen.getByText('Option 2')).toBeInTheDocument();
        });
    });

    it('selects an option when clicked', async () => {
        const user = userEvent.setup();

        render(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                </SelectContent>
            </Select>
        );

        const trigger = screen.getByRole('combobox');
        await user.click(trigger);

        await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument();
        });

        const option1 = screen.getByText('Option 1');
        await user.click(option1);

        await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument();
        });
    });

    it('renders with custom className', () => {
        render(
            <Select>
                <SelectTrigger className="custom-trigger">
                    <SelectValue placeholder="Custom select" />
                </SelectTrigger>
                <SelectContent className="custom-content">
                    <SelectItem value="option1">Option 1</SelectItem>
                </SelectContent>
            </Select>
        );

        const trigger = screen.getByRole('combobox');
        expect(trigger).toHaveClass('custom-trigger');
    });

    it('renders with disabled state', () => {
        render(
            <Select disabled>
                <SelectTrigger>
                    <SelectValue placeholder="Disabled select" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                </SelectContent>
            </Select>
        );

        const trigger = screen.getByRole('combobox');
        expect(trigger).toHaveAttribute('aria-disabled', 'true');
    });

    it('renders with multiple options', () => {
        const options = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
            { value: 'option4', label: 'Option 4' }
        ];

        render(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    {options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );

        const trigger = screen.getByRole('combobox');
        expect(trigger).toBeInTheDocument();
    });

    it('renders with grouped options', () => {
        render(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <div className="px-2 py-1.5 text-sm font-semibold">Group 1</div>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <div className="px-2 py-1.5 text-sm font-semibold">Group 2</div>
                    <SelectItem value="option3">Option 3</SelectItem>
                    <SelectItem value="option4">Option 4</SelectItem>
                </SelectContent>
            </Select>
        );

        const trigger = screen.getByRole('combobox');
        expect(trigger).toBeInTheDocument();
    });

    it('handles keyboard navigation', async () => {
        const user = userEvent.setup();

        render(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                </SelectContent>
            </Select>
        );

        const trigger = screen.getByRole('combobox');
        await user.click(trigger);

        await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument();
        });

        // Test arrow key navigation
        await user.keyboard('{"ArrowDown"}');
        await user.keyboard('{"ArrowDown"}');
        await user.keyboard('{"Enter"}');

        await waitFor(() => {
            expect(screen.getByText('Option 2')).toBeInTheDocument();
        });
    });

    it('closes dropdown when escape is pressed', async () => {
        const user = userEvent.setup();

        render(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                </SelectContent>
            </Select>
        );

        const trigger = screen.getByRole('combobox');
        await user.click(trigger);

        await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument();
        });

        await user.keyboard('{"Escape"}');

        await waitFor(() => {
            expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
        });
    });

    it('renders with custom value', () => {
        render(
            <Select value="option2">
                <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                </SelectContent>
            </Select>
        );

        const trigger = screen.getByRole('combobox');
        expect(trigger).toBeInTheDocument();
    });

    it('renders with default value', () => {
        render(
            <Select defaultValue="option1">
                <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                </SelectContent>
            </Select>
        );

        const trigger = screen.getByRole('combobox');
        expect(trigger).toBeInTheDocument();
    });

    it('renders with custom data attributes', () => {
        render(
            <Select data-testid="custom-select">
                <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1" data-testid="option-1">Option 1</SelectItem>
                </SelectContent>
            </Select>
        );

        const select = screen.getByTestId('custom-select');
        expect(select).toBeInTheDocument();
    });

    it('renders with aria attributes', () => {
        render(
            <Select>
                <SelectTrigger aria-label="Custom select">
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                </SelectContent>
            </Select>
        );

        const trigger = screen.getByRole('combobox');
        expect(trigger).toHaveAttribute('aria-label', 'Custom select');
    });

    it('renders with complex option content', () => {
        render(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">
                        <div className="flex items-center gap-2">
                            <span>🚀</span>
                            <span>Rocket</span>
                            <span className="text-xs text-gray-500">Fast</span>
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
        );

        const trigger = screen.getByRole('combobox');
        expect(trigger).toBeInTheDocument();
    });
});
