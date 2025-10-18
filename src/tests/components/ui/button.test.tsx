/**
 * Type-safe tests for Button component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import type { ButtonProps } from '@/components/ui/button';

describe('Button Component', () => {
    it('renders with default props', () => {
        render(<Button>{"Click me"}</Button>);

        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('renders with different variants', () => {
        const variants: Array<ButtonProps['variant']> = [
            'default',
            'destructive',
            'outline',
            'secondary',
            'ghost',
            'link'
        ];

        variants.forEach(variant => {
            const { unmount } = render(
                <Button variant={variant}>Test {variant}</Button>
            );

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();

            unmount();
        });
    });

    it('renders with different sizes', () => {
        const sizes: Array<ButtonProps['size']> = [
            'default',
            'sm',
            'lg',
            'icon'
        ];

        sizes.forEach(size => {
            const { unmount } = render(
                <Button size={size}>Test {size}</Button>
            );

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();

            unmount();
        });
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled button</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveClass('disabled:opacity-50');
    });

    it('renders as child component when asChild is true', () => {
        render(
            <Button asChild>
                <a href="/test">Link button</a>
            </Button>
        );

        const link = screen.getByRole('link');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/test');
    });

    it('applies custom className', () => {
        render(<Button className="custom-class">Custom button</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
        const ref = vi.fn();
        render(<Button ref={ref}>Ref button</Button>);

        expect(ref).toHaveBeenCalled();
    });

    it('handles keyboard events', () => {
        const handleKeyDown = vi.fn();
        render(<Button onKeyDown={handleKeyDown}>Keyboard button</Button>);

        const button = screen.getByRole('button');
        fireEvent.keyDown(button, { key: 'Enter' });

        expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it('has proper accessibility attributes', () => {
        render(
            <Button
                aria-label="Custom label"
                aria-describedby="description"
            >
                Accessible button
            </Button>
        );

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Custom label');
        expect(button).toHaveAttribute('aria-describedby', 'description');
    });

    it('renders with loading state', () => {
        render(<Button disabled>Loading...</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveTextContent('Loading...');
    });

    it('combines multiple props correctly', () => {
        const handleClick = vi.fn();
        render(
            <Button
                variant="destructive"
                size="lg"
                onClick={handleClick}
                className="custom-class"
                aria-label="Delete item"
            >
                Delete
            </Button>
        );

        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-destructive', 'h-10', 'custom-class');
        expect(button).toHaveAttribute('aria-label', 'Delete item');

        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
