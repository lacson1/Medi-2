import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QualityControl from '@/components/labs/QualityControl';

// Mock the API client
jest.mock('@/api/mockApiClient', () => ({
    mockApiClient: {
        entities: {
            QCTest: {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                list: jest.fn(),
            },
        },
    },
}));

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
});

const renderWithQueryClient = (component: React.ReactElement) => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            {component}
        </QueryClientProvider>
    );
};

describe('Quality Control', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('QC Test Form', () => {
        test('opens QC test form when Add QC Test button is clicked', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                const addButton = screen.getByText('Add QC Test');
                fireEvent.click(addButton);
            });

            expect(screen.getByText('Add New QC Test')).toBeInTheDocument();
        });

        test('form contains all required fields', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                const addButton = screen.getByText('Add QC Test');
                fireEvent.click(addButton);
            });

            expect(screen.getByLabelText('Test Name *')).toBeInTheDocument();
            expect(screen.getByLabelText('Test Type *')).toBeInTheDocument();
            expect(screen.getByLabelText('Target Value')).toBeInTheDocument();
            expect(screen.getByLabelText('Min Range')).toBeInTheDocument();
            expect(screen.getByLabelText('Max Range')).toBeInTheDocument();
            expect(screen.getByLabelText('Actual Value')).toBeInTheDocument();
        });

        test('form includes test type options', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                const addButton = screen.getByText('Add QC Test');
                fireEvent.click(addButton);
            });

            const typeSelect = screen.getByDisplayValue('');
            fireEvent.click(typeSelect);

            expect(screen.getByText('Internal QC')).toBeInTheDocument();
            expect(screen.getByText('External QC')).toBeInTheDocument();
            expect(screen.getByText('Proficiency Testing')).toBeInTheDocument();
            expect(screen.getByText('Calibration')).toBeInTheDocument();
            expect(screen.getByText('Maintenance QC')).toBeInTheDocument();
        });

        test('form includes status options', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                const addButton = screen.getByText('Add QC Test');
                fireEvent.click(addButton);
            });

            const statusSelect = screen.getByDisplayValue('');
            fireEvent.click(statusSelect);

            expect(screen.getByText('Passed')).toBeInTheDocument();
            expect(screen.getByText('Failed')).toBeInTheDocument();
            expect(screen.getByText('Pending')).toBeInTheDocument();
            expect(screen.getByText('In Progress')).toBeInTheDocument();
        });
    });

    describe('Compliance Tracking', () => {
        test('displays compliance metrics', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText('Compliance Rate')).toBeInTheDocument();
                expect(screen.getByText('Compliant Areas')).toBeInTheDocument();
                expect(screen.getByText('Non-Compliant')).toBeInTheDocument();
                expect(screen.getByText('Warnings')).toBeInTheDocument();
            });
        });

        test('shows compliance status badges', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                // Switch to compliance tab
                const complianceTab = screen.getByText('Compliance');
                fireEvent.click(complianceTab);
            });

            await waitFor(() => {
                expect(screen.getByText('Compliant')).toBeInTheDocument();
                expect(screen.getByText('Non-Compliant')).toBeInTheDocument();
                expect(screen.getByText('Warning')).toBeInTheDocument();
            });
        });

        test('displays compliance area details', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                const complianceTab = screen.getByText('Compliance');
                fireEvent.click(complianceTab);
            });

            await waitFor(() => {
                expect(screen.getByText('Personnel Training')).toBeInTheDocument();
                expect(screen.getByText('Equipment Calibration')).toBeInTheDocument();
                expect(screen.getByText('Documentation')).toBeInTheDocument();
            });
        });
    });

    describe('QC Metrics', () => {
        test('displays total tests count', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText('Total Tests')).toBeInTheDocument();
                expect(screen.getByText('7')).toBeInTheDocument(); // Based on mock data
            });
        });

        test('displays passed tests count', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText('Passed')).toBeInTheDocument();
                expect(screen.getByText('5')).toBeInTheDocument(); // Based on mock data
            });
        });

        test('displays failed tests count', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText('Failed')).toBeInTheDocument();
                expect(screen.getByText('2')).toBeInTheDocument(); // Based on mock data
            });
        });

        test('displays pending tests count', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText('Pending')).toBeInTheDocument();
                expect(screen.getByText('1')).toBeInTheDocument(); // Based on mock data
            });
        });

        test('displays in progress tests count', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText('In Progress')).toBeInTheDocument();
                expect(screen.getByText('0')).toBeInTheDocument(); // Based on mock data
            });
        });

        test('displays trend information', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText('Trend')).toBeInTheDocument();
                expect(screen.getByText('vs last week')).toBeInTheDocument();
            });
        });
    });

    describe('Pass/Fail Tracking', () => {
        test('displays pass rate trend metrics', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText('Pass Rate Trend')).toBeInTheDocument();
                expect(screen.getByText('This Week')).toBeInTheDocument();
                expect(screen.getByText('Last Week')).toBeInTheDocument();
            });
        });

        test('shows test distribution by type', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText('Test Distribution')).toBeInTheDocument();
                expect(screen.getByText('Internal QC')).toBeInTheDocument();
                expect(screen.getByText('Proficiency Testing')).toBeInTheDocument();
                expect(screen.getByText('Calibration')).toBeInTheDocument();
            });
        });

        test('displays QC test cards with status', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText('Glucose Control')).toBeInTheDocument();
                expect(screen.getByText('Hematology Control')).toBeInTheDocument();
                expect(screen.getByText('Passed')).toBeInTheDocument();
                expect(screen.getByText('Failed')).toBeInTheDocument();
            });
        });

        test('shows actual vs target values', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText('Target:')).toBeInTheDocument();
                expect(screen.getByText('Actual:')).toBeInTheDocument();
                expect(screen.getByText('Acceptable Range:')).toBeInTheDocument();
            });
        });
    });

    describe('Corrective Actions', () => {
        test('displays corrective actions for failed tests', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText('Corrective Action:')).toBeInTheDocument();
                expect(screen.getByText('Recalibrated analyzer and retested')).toBeInTheDocument();
            });
        });

        test('shows corrective action field in form', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                const addButton = screen.getByText('Add QC Test');
                fireEvent.click(addButton);
            });

            expect(screen.getByLabelText('Corrective Action')).toBeInTheDocument();
        });

        test('displays corrective actions in alerts', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText(/Critical: You have 2 failed QC tests/)).toBeInTheDocument();
                expect(screen.getByText('Action: Recalibrated analyzer and retested')).toBeInTheDocument();
            });
        });
    });

    describe('Filter and Search', () => {
        test('filters by test type', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                const typeSelect = screen.getByDisplayValue('All Types');
                fireEvent.click(typeSelect);
            });

            expect(screen.getByText('Internal QC')).toBeInTheDocument();
            expect(screen.getByText('External QC')).toBeInTheDocument();
            expect(screen.getByText('Proficiency Testing')).toBeInTheDocument();
        });

        test('filters by test status', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                const statusSelect = screen.getByDisplayValue('All Status');
                fireEvent.click(statusSelect);
            });

            expect(screen.getByText('Passed')).toBeInTheDocument();
            expect(screen.getByText('Failed')).toBeInTheDocument();
            expect(screen.getByText('Pending')).toBeInTheDocument();
        });

        test('searches tests by name', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText('Search tests...');
                fireEvent.change(searchInput, { target: { value: 'Glucose' } });
            });

            expect(screen.getByText('Glucose Control')).toBeInTheDocument();
        });
    });

    describe('Edit QC Test Function', () => {
        test('opens edit form when edit button is clicked', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                const editButtons = screen.getAllByRole('button', { name: /edit/i });
                fireEvent.click(editButtons[0]);
            });

            expect(screen.getByText('Edit QC Test')).toBeInTheDocument();
        });

        test('populates form with existing test data', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                const editButtons = screen.getAllByRole('button', { name: /edit/i });
                fireEvent.click(editButtons[0]);
            });

            expect(screen.getByDisplayValue('Glucose Control')).toBeInTheDocument();
        });
    });

    describe('Tabs Navigation', () => {
        test('switches between QC Tests and Compliance tabs', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText('QC Tests')).toBeInTheDocument();
                expect(screen.getByText('Compliance')).toBeInTheDocument();
                expect(screen.getByText('Trends & Analytics')).toBeInTheDocument();
            });

            // Click on Compliance tab
            fireEvent.click(screen.getByText('Compliance'));

            await waitFor(() => {
                expect(screen.getByText('Personnel Training')).toBeInTheDocument();
            });

            // Click on Trends tab
            fireEvent.click(screen.getByText('Trends & Analytics'));

            await waitFor(() => {
                expect(screen.getByText('QC Trends & Analytics')).toBeInTheDocument();
            });
        });
    });

    describe('Alerts and Notifications', () => {
        test('displays failed QC tests alert', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText(/Critical: You have 2 failed QC tests/)).toBeInTheDocument();
            });
        });

        test('displays non-compliant areas alert', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText(/Critical: You have 1 non-compliant areas/)).toBeInTheDocument();
            });
        });

        test('displays warning areas alert', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText(/Warning: You have 2 areas with compliance warnings/)).toBeInTheDocument();
            });
        });

        test('displays pending tests alert', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText(/Info: You have 1 QC tests pending completion/)).toBeInTheDocument();
            });
        });
    });

    describe('Test Results Display', () => {
        test('shows test results with proper formatting', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText('98')).toBeInTheDocument(); // Actual value
                expect(screen.getByText('100')).toBeInTheDocument(); // Target value
                expect(screen.getByText('95 - 105')).toBeInTheDocument(); // Acceptable range
            });
        });

        test('highlights out-of-range values', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                // Failed test should show red highlighting
                const failedTestValue = screen.getByText('7.8');
                expect(failedTestValue).toHaveClass('text-red-600');
            });
        });

        test('shows test performance details', async () => {
            renderWithQueryClient(<QualityControl />);

            await waitFor(() => {
                expect(screen.getByText('Performed by:')).toBeInTheDocument();
                expect(screen.getByText('John Smith')).toBeInTheDocument();
                expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
            });
        });
    });
});
