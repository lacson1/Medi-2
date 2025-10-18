/**
 * Type-safe tests for Input component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/input';
import type { InputProps } from '@/components/ui/input';

describe('Input Component', () => {
    it('renders with default props', () => {
        render(<Input />);

        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
        expect(input).toHaveClass('flex', 'h-9', 'w-full');
    });

    it('renders with different input types', () => {
        const types: Array<InputProps['type']> = [
            'text',
            'email',
            'password',
            'number',
            'tel',
            'url',
            'search'
        ];

        types.forEach(type => {
            const { unmount } = render(<Input type={type} />);

            const input = screen.getByRole(type === 'password' ? 'textbox' : 'textbox');
            expect(input).toHaveAttribute('type', type);

            unmount();
        });
    });

    it('handles value changes', () => {
        const handleChange = vi.fn();
        render(<Input onChange={handleChange} />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'test value' } });

        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledWith(
            expect.objectContaining({
                target: expect.objectContaining({ value: 'test value' })
            })
        );
    });

    it('is disabled when disabled prop is true', () => {
        render(<Input disabled />);

        const input = screen.getByRole('textbox');
        expect(input).toBeDisabled();
        expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('renders with placeholder', () => {
        render(<Input placeholder="Enter text here" />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('placeholder', 'Enter text here');
    });

    it('renders with value', () => {
        render(<Input value="test value" />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('test value');
    });

    it('applies custom className', () => {
        render(<Input className="custom-class" />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
        const ref = vi.fn();
        render(<Input ref={ref} />);

        expect(ref).toHaveBeenCalled();
    });

    it('handles focus events', () => {
        const handleFocus = vi.fn();
        const handleBlur = vi.fn();

        render(
            <Input
                onFocus={handleFocus}
                onBlur={handleBlur}
            />
        );

        const input = screen.getByRole('textbox');

        fireEvent.focus(input);
        expect(handleFocus).toHaveBeenCalledTimes(1);

        fireEvent.blur(input);
        expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard events', () => {
        const handleKeyDown = vi.fn();
        const handleKeyUp = vi.fn();

        render(
            <Input
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
            />
        );

        const input = screen.getByRole('textbox');

        fireEvent.keyDown(input, { key: 'Enter' });
        expect(handleKeyDown).toHaveBeenCalledTimes(1);

        fireEvent.keyUp(input, { key: 'Enter' });
        expect(handleKeyUp).toHaveBeenCalledTimes(1);
    });

    it('has proper accessibility attributes', () => {
        render(
            <Input
                aria-label="Custom label"
                aria-describedby="description"
                aria-invalid="true"
                aria-required="true"
            />
        );

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('aria-label', 'Custom label');
        expect(input).toHaveAttribute('aria-describedby', 'description');
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('renders with file input type', () => {
        render(<Input type="file" />);

        const input = screen.getByRole('button');
        expect(input).toHaveAttribute('type', 'file');
    });

    it('combines multiple props correctly', () => {
        const handleChange = vi.fn();
        render(
            <Input
                type="email"
                placeholder="Enter email"
                value="test@example.com"
                onChange={handleChange}
                className="custom-class"
                aria-label="Email input"
                required
            />
        );

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('type', 'email');
        expect(input).toHaveAttribute('placeholder', 'Enter email');
        expect(input).toHaveValue('test@example.com');
        expect(input).toHaveClass('custom-class');
        expect(input).toHaveAttribute('aria-label', 'Email input');
        expect(input).toBeRequired();

        fireEvent.change(input, { target: { value: 'new@example.com' } });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('renders with maxLength attribute', () => {
        render(<Input maxLength={10} />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('maxLength', '10');
    });

    it('renders with min and max attributes for number input', () => {
        render(<Input type="number" min={0} max={100} />);

        const input = screen.getByRole('spinbutton');
        expect(input).toHaveAttribute('type', 'number');
        expect(input).toHaveAttribute('min', '0');
        expect(input).toHaveAttribute('max', '100');
    });
});
