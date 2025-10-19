/**
 * Type-safe tests for Card component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '@/components/ui/card';

describe('Card Component', () => {
    it('renders Card with default props', () => {
        render(<Card>{"Card content"}</Card>);

        const card = screen.getByText('Card content');
        expect(card).toBeInTheDocument();
        expect(card).toHaveClass('rounded-xl', 'border', 'border-outline', 'bg-surface', 'text-surface-foreground', 'shadow-sm');
    });

    it('renders Card with custom className', () => {
        render(<Card className="custom-card">Custom card</Card>);

        const card = screen.getByText('Custom card');
        expect(card).toHaveClass('custom-card');
    });

    it('forwards ref correctly', () => {
        const ref = vi.fn();
        render(<Card ref={ref}>Ref card</Card>);

        expect(ref).toHaveBeenCalled();
    });

    it('renders complete card structure', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>{"Card Title"}</CardTitle>
                    <CardDescription>{"Card description"}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Card content goes here</p>
                </CardContent>
                <CardFooter>
                    <button>Action</button>
                </CardFooter>
            </Card>
        );

        expect(screen.getByText('Card Title')).toBeInTheDocument();
        expect(screen.getByText('Card description')).toBeInTheDocument();
        expect(screen.getByText('Card content goes here')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('renders CardHeader with proper styling', () => {
        render(
            <Card>
                <CardHeader>{"Header content"}</CardHeader>
            </Card>
        );

        const header = screen.getByText('Header content');
        expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('renders CardTitle with proper styling', () => {
        render(
            <Card>
                <CardTitle>{"Title"}</CardTitle>
            </Card>
        );

        const title = screen.getByText('Title');
        expect(title).toHaveClass('card-title', 'leading-none', 'tracking-tight');
        expect(title.tagName).toBe('DIV');
    });

    it('renders CardDescription with proper styling', () => {
        render(
            <Card>
                <CardDescription>{"Description"}</CardDescription>
            </Card>
        );

        const description = screen.getByText('Description');
        expect(description).toHaveClass('card-subtitle');
    });

    it('renders CardContent with proper styling', () => {
        render(
            <Card>
                <CardContent>{"Content"}</CardContent>
            </Card>
        );

        const content = screen.getByText('Content');
        expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('renders CardFooter with proper styling', () => {
        render(
            <Card>
                <CardFooter>{"Footer"}</CardFooter>
            </Card>
        );

        const footer = screen.getByText('Footer');
        expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });

    it('handles custom props on Card components', () => {
        render(
            <Card data-testid="card">
                <CardHeader data-testid="header">
                    <CardTitle data-testid="title">Title</CardTitle>
                    <CardDescription data-testid="description">Description</CardDescription>
                </CardHeader>
                <CardContent data-testid="content">Content</CardContent>
                <CardFooter data-testid="footer">Footer</CardFooter>
            </Card>
        );

        expect(screen.getByTestId('card')).toBeInTheDocument();
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('title')).toBeInTheDocument();
        expect(screen.getByTestId('description')).toBeInTheDocument();
        expect(screen.getByTestId('content')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders nested cards', () => {
        render(
            <Card>
                <CardContent>
                    <Card>
                        <CardContent>{"Nested card content"}</CardContent>
                    </Card>
                </CardContent>
            </Card>
        );

        expect(screen.getByText('Nested card content')).toBeInTheDocument();
    });

    it('renders card with interactive elements', () => {
        const handleClick = vi.fn();

        render(
            <Card>
                <CardContent>
                    <button onClick={handleClick}>Click me</button>
                </CardContent>
            </Card>
        );

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
