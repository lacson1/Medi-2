/**
 * Type-safe tests for Label component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Label } from '@/components/ui/label';

describe('Label Component', () => {
    it('renders with default props', () => {
        render(<Label>{"Label text"}</Label>);

        const label = screen.getByText('Label text');
        expect(label).toBeInTheDocument();
        expect(label).toHaveClass('text-label-large', 'leading-none', 'peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70');
    });

    it('renders with custom className', () => {
        render(<Label className="custom-label">Custom label</Label>);

        const label = screen.getByText('Custom label');
        expect(label).toHaveClass('custom-label');
    });

    it('forwards ref correctly', () => {
        const ref = vi.fn();
        render(<Label ref={ref}>Ref label</Label>);

        expect(ref).toHaveBeenCalled();
    });

    it('associates with form control via htmlFor', () => {
        render(
            <div>
                <Label htmlFor="test-input">Test Label</Label>
                <input id="test-input" type="text" />
            </div>
        );

        const label = screen.getByText('Test Label');
        const input = screen.getByRole('textbox');

        expect(label).toHaveAttribute('for', 'test-input');
        expect(input).toHaveAttribute('id', 'test-input');
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Label onClick={handleClick}>Clickable label</Label>);

        const label = screen.getByText('Clickable label');
        fireEvent.click(label);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard events', () => {
        const handleKeyDown = vi.fn();
        render(<Label onKeyDown={handleKeyDown}>Keyboard label</Label>);

        const label = screen.getByText('Keyboard label');
        fireEvent.keyDown(label, { key: 'Enter' });

        expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it('has proper accessibility attributes', () => {
        render(
            <Label
                aria-label="Custom label"
                aria-describedby="description"
                role="button"
            >
                Accessible label
            </Label>
        );

        const label = screen.getByRole('button');
        expect(label).toHaveAttribute('aria-label', 'Custom label');
        expect(label).toHaveAttribute('aria-describedby', 'description');
    });

    it('renders with different text content', () => {
        const texts = ['Short', 'This is a longer label text', 'Label with numbers 123'];

        texts.forEach(text => {
            const { unmount } = render(<Label>{text}</Label>);

            const label = screen.getByText(text);
            expect(label).toBeInTheDocument();

            unmount();
        });
    });

    it('renders with HTML content', () => {
        render(
            <Label>
                <span>Bold</span> and <em>italic</em> text
            </Label>
        );

        const label = screen.getByText('Bold');
        expect(label).toBeInTheDocument();
        expect(screen.getByText('italic')).toBeInTheDocument();
    });

    it('handles focus events', () => {
        const handleFocus = vi.fn();
        const handleBlur = vi.fn();

        render(
            <Label
                onFocus={handleFocus}
                onBlur={handleBlur}
                tabIndex={0}
            >
                Focusable label
            </Label>
        );

        const label = screen.getByText('Focusable label');

        fireEvent.focus(label);
        expect(handleFocus).toHaveBeenCalledTimes(1);

        fireEvent.blur(label);
        expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('renders with disabled state styling', () => {
        render(<Label className="peer-disabled:opacity-70">Disabled label</Label>);

        const label = screen.getByText('Disabled label');
        expect(label).toHaveClass('peer-disabled:opacity-70');
    });

    it('combines multiple props correctly', () => {
        const handleClick = vi.fn();
        render(
            <Label
                htmlFor="complex-input"
                onClick={handleClick}
                className="custom-class"
                aria-label="Complex label"
                data-testid="complex-label"
            >
                Complex label
            </Label>
        );

        const label = screen.getByTestId('complex-label');
        expect(label).toHaveAttribute('for', 'complex-input');
        expect(label).toHaveAttribute('aria-label', 'Complex label');
        expect(label).toHaveClass('custom-class');

        fireEvent.click(label);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders with required indicator', () => {
        render(
            <Label>
                Required field <span className="text-red-500">*</span>
            </Label>
        );

        const label = screen.getByText('Required field');
        expect(label).toBeInTheDocument();
        expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with help text', () => {
        render(
            <div>
                <Label htmlFor="help-input">Field with help</Label>
                <input id="help-input" type="text" />
                <p className="text-sm text-gray-500">This is help text</p>
            </div>
        );

        expect(screen.getByText('Field with help')).toBeInTheDocument();
        expect(screen.getByText('This is help text')).toBeInTheDocument();
    });
});
