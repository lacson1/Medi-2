import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EquipmentManager from '@/components/labs/EquipmentManager';

// Mock the API client
jest.mock('@/api/mockApiClient', () => ({
    mockApiClient: {
        entities: {
            Equipment: {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                list: jest.fn(),
            },
            MaintenanceRecord: {
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

describe('Equipment Manager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Equipment Metrics', () => {
        test('displays total equipment count', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText('Total Equipment')).toBeInTheDocument();
                expect(screen.getByText('6')).toBeInTheDocument(); // Based on mock data
            });
        });

        test('displays operational equipment count', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText('Operational')).toBeInTheDocument();
                expect(screen.getByText('3')).toBeInTheDocument(); // Based on mock data
            });
        });

        test('displays maintenance due count', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText('Maintenance Due')).toBeInTheDocument();
                expect(screen.getByText('1')).toBeInTheDocument(); // Based on mock data
            });
        });

        test('displays under maintenance count', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText('Under Maintenance')).toBeInTheDocument();
                expect(screen.getByText('1')).toBeInTheDocument(); // Based on mock data
            });
        });

        test('displays out of order count', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText('Out of Order')).toBeInTheDocument();
                expect(screen.getByText('1')).toBeInTheDocument(); // Based on mock data
            });
        });

        test('displays calibration due count', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText('Calibration Due')).toBeInTheDocument();
                expect(screen.getByText('1')).toBeInTheDocument(); // Based on mock data
            });
        });
    });

    describe('Add Equipment Form', () => {
        test('opens add equipment form when Add Equipment button is clicked', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                const addButton = screen.getByText('Add Equipment');
                fireEvent.click(addButton);
            });

            expect(screen.getByText('Add New Equipment')).toBeInTheDocument();
        });

        test('form contains all required fields', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                const addButton = screen.getByText('Add Equipment');
                fireEvent.click(addButton);
            });

            expect(screen.getByLabelText('Equipment Name *')).toBeInTheDocument();
            expect(screen.getByLabelText('Equipment Type *')).toBeInTheDocument();
        });

        test('form includes equipment type options', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                const addButton = screen.getByText('Add Equipment');
                fireEvent.click(addButton);
            });

            const typeSelect = screen.getByDisplayValue('');
            fireEvent.click(typeSelect);

            expect(screen.getByText('Analyzer')).toBeInTheDocument();
            expect(screen.getByText('Microscope')).toBeInTheDocument();
            expect(screen.getByText('Centrifuge')).toBeInTheDocument();
        });
    });

    describe('Schedule Maintenance', () => {
        test('opens maintenance form when Schedule Maintenance button is clicked', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                const maintenanceButton = screen.getByText('Schedule Maintenance');
                fireEvent.click(maintenanceButton);
            });

            expect(screen.getByText('Schedule Maintenance')).toBeInTheDocument();
        });

        test('maintenance form contains required fields', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                const maintenanceButton = screen.getByText('Schedule Maintenance');
                fireEvent.click(maintenanceButton);
            });

            expect(screen.getByLabelText('Equipment')).toBeInTheDocument();
            expect(screen.getByLabelText('Maintenance Type')).toBeInTheDocument();
            expect(screen.getByLabelText('Scheduled Date')).toBeInTheDocument();
        });

        test('maintenance form includes maintenance type options', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                const maintenanceButton = screen.getByText('Schedule Maintenance');
                fireEvent.click(maintenanceButton);
            });

            const typeSelect = screen.getByDisplayValue('');
            fireEvent.click(typeSelect);

            expect(screen.getByText('Preventive')).toBeInTheDocument();
            expect(screen.getByText('Corrective')).toBeInTheDocument();
            expect(screen.getByText('Calibration')).toBeInTheDocument();
            expect(screen.getByText('Inspection')).toBeInTheDocument();
        });
    });

    describe('Equipment Status', () => {
        test('displays equipment status badges correctly', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText('Operational')).toBeInTheDocument();
                expect(screen.getByText('Under Maintenance')).toBeInTheDocument();
                expect(screen.getByText('Out of Order')).toBeInTheDocument();
                expect(screen.getByText('Calibration Due')).toBeInTheDocument();
            });
        });

        test('shows utilization rates for equipment', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText('Utilization:')).toBeInTheDocument();
                expect(screen.getByText('85%')).toBeInTheDocument(); // From mock data
            });
        });

        test('displays maintenance due dates', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText('Next Maintenance:')).toBeInTheDocument();
            });
        });

        test('shows overdue maintenance warnings', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText('Overdue')).toBeInTheDocument();
            });
        });
    });

    describe('Maintenance Alerts', () => {
        test('displays maintenance due alert', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText(/Warning: You have 1 equipment items with overdue maintenance/)).toBeInTheDocument();
            });
        });

        test('displays out of order alert', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText(/Critical: You have 1 equipment items out of order/)).toBeInTheDocument();
            });
        });

        test('displays calibration due alert', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText(/Alert: You have 1 equipment items requiring calibration/)).toBeInTheDocument();
            });
        });

        test('displays under maintenance info alert', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText(/Info: You have 1 equipment items currently under maintenance/)).toBeInTheDocument();
            });
        });
    });

    describe('Filter and Search', () => {
        test('filters by equipment type', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                const typeSelect = screen.getByDisplayValue('All Types');
                fireEvent.click(typeSelect);
            });

            expect(screen.getByText('Analyzer')).toBeInTheDocument();
            expect(screen.getByText('Microscope')).toBeInTheDocument();
            expect(screen.getByText('Centrifuge')).toBeInTheDocument();
        });

        test('filters by equipment status', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                const statusSelect = screen.getByDisplayValue('All Status');
                fireEvent.click(statusSelect);
            });

            expect(screen.getByText('Operational')).toBeInTheDocument();
            expect(screen.getByText('Under Maintenance')).toBeInTheDocument();
            expect(screen.getByText('Out of Order')).toBeInTheDocument();
        });

        test('searches equipment by name', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText('Search equipment...');
                fireEvent.change(searchInput, { target: { value: 'Hematology' } });
            });

            expect(screen.getByText('Hematology Analyzer')).toBeInTheDocument();
        });
    });

    describe('Equipment Display', () => {
        test('displays equipment cards with all information', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText('Hematology Analyzer')).toBeInTheDocument();
                expect(screen.getByText('Sysmex XN-1000')).toBeInTheDocument();
                expect(screen.getByText('SYM001234')).toBeInTheDocument();
                expect(screen.getByText('Lab Room A')).toBeInTheDocument();
            });
        });

        test('shows utilization progress bars', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getAllByText('Utilization:')).toHaveLength(6); // One for each equipment
            });
        });

        test('displays warranty information', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText('Warranty:')).toBeInTheDocument();
            });
        });
    });

    describe('Additional Metrics', () => {
        test('displays utilization rate metrics', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText('Utilization Rate')).toBeInTheDocument();
                expect(screen.getByText('Average Utilization')).toBeInTheDocument();
            });
        });

        test('displays maintenance costs breakdown', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText('Maintenance Costs')).toBeInTheDocument();
                expect(screen.getByText('Completed')).toBeInTheDocument();
                expect(screen.getByText('Pending')).toBeInTheDocument();
            });
        });

        test('displays equipment age metrics', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                expect(screen.getByText('Equipment Age')).toBeInTheDocument();
                expect(screen.getByText('Average Age')).toBeInTheDocument();
            });
        });
    });

    describe('Edit Equipment Function', () => {
        test('opens edit form when edit button is clicked', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                const editButtons = screen.getAllByRole('button', { name: /edit/i });
                fireEvent.click(editButtons[0]);
            });

            expect(screen.getByText('Edit Equipment')).toBeInTheDocument();
        });

        test('populates form with existing equipment data', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                const editButtons = screen.getAllByRole('button', { name: /edit/i });
                fireEvent.click(editButtons[0]);
            });

            expect(screen.getByDisplayValue('Hematology Analyzer')).toBeInTheDocument();
        });
    });

    describe('Schedule Maintenance from Equipment Card', () => {
        test('opens maintenance form when maintenance button is clicked on equipment card', async () => {
            renderWithQueryClient(<EquipmentManager />);

            await waitFor(() => {
                const maintenanceButtons = screen.getAllByRole('button', { name: /wrench/i });
                fireEvent.click(maintenanceButtons[0]);
            });

            expect(screen.getByText('Schedule Maintenance')).toBeInTheDocument();
        });
    });
});
