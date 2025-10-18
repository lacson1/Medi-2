/**
 * Type-safe tests for Badge component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';

describe('Badge Component', () => {
    it('renders with default props', () => {
        render(<Badge>{"Default badge"}</Badge>);

        const badge = screen.getByText('Default badge');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-md', 'border');
    });

    it('renders with different variants', () => {
        const variants: Array<BadgeProps['variant']> = [
            'default',
            'secondary',
            'destructive',
            'outline'
        ];

        variants.forEach(variant => {
            const { unmount } = render(
                <Badge variant={variant}>Test {variant}</Badge>
            );

            const badge = screen.getByText(`Test ${variant}`);
            expect(badge).toBeInTheDocument();

            unmount();
        });
    });

    it('renders with custom className', () => {
        render(<Badge className="custom-badge">Custom badge</Badge>);

        const badge = screen.getByText('Custom badge');
        expect(badge).toHaveClass('custom-badge');
    });

    it('renders with different text content', () => {
        const texts = ['Short', 'Medium length text', 'This is a longer badge text content'];

        texts.forEach(text => {
            const { unmount } = render(<Badge>{{ text }}</Badge>);

            const badge = screen.getByText(text);
            expect(badge).toBeInTheDocument();

            unmount();
        });
    });

    it('renders with HTML content', () => {
        render(
            <Badge>
                <span>Icon</span> Text
            </Badge>
        );

        const badge = screen.getByText('Icon');
        expect(badge).toBeInTheDocument();
        expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('renders with numbers', () => {
        render(<Badge>{123}</Badge>);

        const badge = screen.getByText('123');
        expect(badge).toBeInTheDocument();
    });

    it('renders with special characters', () => {
        render(<Badge>{'!@#$%'}</Badge>);

        const badge = screen.getByText('!@#$%');
        expect(badge).toBeInTheDocument();
    });

    it('renders with emoji', () => {
        render(<Badge>{'🚀'}</Badge>);

        const badge = screen.getByText('🚀');
        expect(badge).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
        render(
            <Badge
                role="status"
                aria-label="Status badge"
                data-testid="status-badge"
            >
                Active
            </Badge>
        );

        const badge = screen.getByTestId('status-badge');
        expect(badge).toHaveAttribute('role', 'status');
        expect(badge).toHaveAttribute('aria-label', 'Status badge');
    });

    it('renders with custom data attributes', () => {
        render(
            <Badge
                data-status="active"
                data-priority="high"
                data-testid="custom-badge"
            >
                Custom
            </Badge>
        );

        const badge = screen.getByTestId('custom-badge');
        expect(badge).toHaveAttribute('data-status', 'active');
        expect(badge).toHaveAttribute('data-priority', 'high');
    });

    it('renders with different sizes using className', () => {
        render(
            <Badge className="text-xs">Small</Badge>
        );

        const badge = screen.getByText('Small');
        expect(badge).toHaveClass('text-xs');
    });

    it('renders with custom styling', () => {
        render(
            <Badge
                style={{ backgroundColor: 'red', color: 'white' }}
                className="custom-style"
            >
                Styled badge
            </Badge>
        );

        const badge = screen.getByText('Styled badge');
        expect(badge).toHaveStyle('background-color: red');
        expect(badge).toHaveStyle('color: white');
        expect(badge).toHaveClass('custom-style');
    });

    it('renders multiple badges', () => {
        render(
            <div>
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
            </div>
        );

        expect(screen.getByText('Default')).toBeInTheDocument();
        expect(screen.getByText('Secondary')).toBeInTheDocument();
        expect(screen.getByText('Destructive')).toBeInTheDocument();
        expect(screen.getByText('Outline')).toBeInTheDocument();
    });

    it('renders with conditional content', () => {
        const showIcon = true;
        const count = 5;

        render(
            <Badge>
                {showIcon && <span>🔔</span>}
                {count > 0 && ` ${count}`}
            </Badge>
        );

        expect(screen.getByText('🔔')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders with dynamic variant based on props', () => {
        const status = 'error';
        const getVariant = (status: string): BadgeProps['variant'] => {
            switch (status) {
                case 'error': return 'destructive';
                case 'warning': return 'secondary';
                case 'success': return 'default';
                default: return 'outline';
            }
        };

        render(
            <Badge variant={getVariant(status)}>
                {status}
            </Badge>
        );

        const badge = screen.getByText('error');
        expect(badge).toBeInTheDocument();
    });

    it('renders with complex content structure', () => {
        render(
            <Badge>
                <div className="flex items-center gap-1">
                    <span>📊</span>
                    <span>Analytics</span>
                    <span className="text-xs">(24)</span>
                </div>
            </Badge>
        );

        expect(screen.getByText('📊')).toBeInTheDocument();
        expect(screen.getByText('Analytics')).toBeInTheDocument();
        expect(screen.getByText('(24)')).toBeInTheDocument();
    });
});
