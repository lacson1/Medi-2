import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LaboratoryManagement from '@/pages/LaboratoryManagement';

// Mock the API client
jest.mock('@/api/mockApiClient', () => ({
    mockApiClient: {
        entities: {
            LabOrder: {
                list: jest.fn(),
            },
            InventoryItem: {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                list: jest.fn(),
            },
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

describe('Laboratory Management Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Overview Tab Integration', () => {
        test('displays lab management overview with metrics', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            await waitFor(() => {
                expect(screen.getByText('Lab Management Overview')).toBeInTheDocument();
                expect(screen.getByText('Total Lab Orders')).toBeInTheDocument();
                expect(screen.getByText('Pending Results')).toBeInTheDocument();
                expect(screen.getByText('Completed Today')).toBeInTheDocument();
                expect(screen.getByText('Equipment Status')).toBeInTheDocument();
            });
        });

        test('shows recent activity feed', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            await waitFor(() => {
                expect(screen.getByText('Recent Activity')).toBeInTheDocument();
                expect(screen.getByText('QC Test Completed')).toBeInTheDocument();
                expect(screen.getByText('Inventory Updated')).toBeInTheDocument();
                expect(screen.getByText('Equipment Maintenance')).toBeInTheDocument();
            });
        });
    });

    describe('Tab Navigation Integration', () => {
        test('switches between all lab management tabs', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            await waitFor(() => {
                // Check that all tabs are present
                expect(screen.getByText('Overview')).toBeInTheDocument();
                expect(screen.getByText('Inventory')).toBeInTheDocument();
                expect(screen.getByText('Equipment')).toBeInTheDocument();
                expect(screen.getByText('Quality Control')).toBeInTheDocument();
            });

            // Test Inventory tab
            fireEvent.click(screen.getByText('Inventory'));
            await waitFor(() => {
                expect(screen.getByText('Inventory Management')).toBeInTheDocument();
                expect(screen.getByText('Add Item')).toBeInTheDocument();
            });

            // Test Equipment tab
            fireEvent.click(screen.getByText('Equipment'));
            await waitFor(() => {
                expect(screen.getByText('Equipment Management')).toBeInTheDocument();
                expect(screen.getByText('Add Equipment')).toBeInTheDocument();
                expect(screen.getByText('Schedule Maintenance')).toBeInTheDocument();
            });

            // Test Quality Control tab
            fireEvent.click(screen.getByText('Quality Control'));
            await waitFor(() => {
                expect(screen.getByText('Quality Control Tests')).toBeInTheDocument();
                expect(screen.getByText('Add QC Test')).toBeInTheDocument();
            });
        });
    });

    describe('Cross-Module Data Integration', () => {
        test('inventory metrics reflect in overview', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            await waitFor(() => {
                // Check overview metrics
                expect(screen.getByText('Total Items')).toBeInTheDocument();
                expect(screen.getByText('Low Stock')).toBeInTheDocument();
                expect(screen.getByText('Out of Stock')).toBeInTheDocument();
            });
        });

        test('equipment metrics reflect in overview', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            await waitFor(() => {
                // Check equipment status in overview
                expect(screen.getByText('Operational')).toBeInTheDocument();
                expect(screen.getByText('Under Maintenance')).toBeInTheDocument();
                expect(screen.getByText('Out of Order')).toBeInTheDocument();
            });
        });

        test('QC metrics reflect in overview', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            await waitFor(() => {
                // Check QC status in overview
                expect(screen.getByText('QC Tests')).toBeInTheDocument();
                expect(screen.getByText('Pass Rate')).toBeInTheDocument();
            });
        });
    });

    describe('Alert Integration', () => {
        test('displays critical alerts from all modules', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            await waitFor(() => {
                // Check for alerts from different modules
                expect(screen.getByText(/Critical:/)).toBeInTheDocument();
                expect(screen.getByText(/Warning:/)).toBeInTheDocument();
                expect(screen.getByText(/Alert:/)).toBeInTheDocument();
            });
        });

        test('alerts are properly categorized by severity', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            await waitFor(() => {
                // Check for different alert types
                const criticalAlerts = screen.getAllByText(/Critical:/);
                const warningAlerts = screen.getAllByText(/Warning:/);
                const infoAlerts = screen.getAllByText(/Info:/);

                expect(criticalAlerts.length).toBeGreaterThan(0);
                expect(warningAlerts.length).toBeGreaterThan(0);
                expect(infoAlerts.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Form Integration', () => {
        test('add item form works across modules', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            // Navigate to inventory tab
            fireEvent.click(screen.getByText('Inventory'));

            await waitFor(() => {
                const addButton = screen.getByText('Add Item');
                fireEvent.click(addButton);
            });

            expect(screen.getByText('Add New Inventory Item')).toBeInTheDocument();
        });

        test('add equipment form works across modules', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            // Navigate to equipment tab
            fireEvent.click(screen.getByText('Equipment'));

            await waitFor(() => {
                const addButton = screen.getByText('Add Equipment');
                fireEvent.click(addButton);
            });

            expect(screen.getByText('Add New Equipment')).toBeInTheDocument();
        });

        test('add QC test form works across modules', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            // Navigate to quality control tab
            fireEvent.click(screen.getByText('Quality Control'));

            await waitFor(() => {
                const addButton = screen.getByText('Add QC Test');
                fireEvent.click(addButton);
            });

            expect(screen.getByText('Add New QC Test')).toBeInTheDocument();
        });
    });

    describe('Data Consistency', () => {
        test('metrics are consistent across tabs', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            await waitFor(() => {
                // Get metrics from overview
                const overviewTotalItems = screen.getByText('6'); // Total items from overview

                // Navigate to inventory tab
                fireEvent.click(screen.getByText('Inventory'));

                await waitFor(() => {
                    // Check that inventory tab shows same total
                    expect(screen.getByText('6')).toBeInTheDocument();
                });
            });
        });

        test('status indicators are consistent', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            await waitFor(() => {
                // Check operational equipment count in overview
                expect(screen.getByText('3')).toBeInTheDocument(); // Operational equipment

                // Navigate to equipment tab
                fireEvent.click(screen.getByText('Equipment'));

                await waitFor(() => {
                    // Check that equipment tab shows same count
                    expect(screen.getByText('3')).toBeInTheDocument();
                });
            });
        });
    });

    describe('User Workflow Integration', () => {
        test('complete workflow from overview to specific module', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            await waitFor(() => {
                // Start from overview
                expect(screen.getByText('Lab Management Overview')).toBeInTheDocument();

                // Navigate to inventory to check low stock
                fireEvent.click(screen.getByText('Inventory'));
            });

            await waitFor(() => {
                expect(screen.getByText('Low Stock')).toBeInTheDocument();

                // Add new item
                const addButton = screen.getByText('Add Item');
                fireEvent.click(addButton);
            });

            expect(screen.getByText('Add New Inventory Item')).toBeInTheDocument();
        });

        test('maintenance workflow integration', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            await waitFor(() => {
                // Navigate to equipment tab
                fireEvent.click(screen.getByText('Equipment'));
            });

            await waitFor(() => {
                // Check maintenance due alerts
                expect(screen.getByText(/Warning: You have 1 equipment items with overdue maintenance/)).toBeInTheDocument();

                // Schedule maintenance
                const maintenanceButton = screen.getByText('Schedule Maintenance');
                fireEvent.click(maintenanceButton);
            });

            expect(screen.getByText('Schedule Maintenance')).toBeInTheDocument();
        });

        test('QC workflow integration', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            await waitFor(() => {
                // Navigate to quality control tab
                fireEvent.click(screen.getByText('Quality Control'));
            });

            await waitFor(() => {
                // Check failed QC alerts
                expect(screen.getByText(/Critical: You have 2 failed QC tests/)).toBeInTheDocument();

                // Add new QC test
                const addButton = screen.getByText('Add QC Test');
                fireEvent.click(addButton);
            });

            expect(screen.getByText('Add New QC Test')).toBeInTheDocument();
        });
    });

    describe('Performance Integration', () => {
        test('all modules load without performance issues', async () => {
            const startTime = performance.now();

            renderWithQueryClient(<LaboratoryManagement />);

            await waitFor(() => {
                expect(screen.getByText('Lab Management Overview')).toBeInTheDocument();
            });

            const endTime = performance.now();
            const loadTime = endTime - startTime;

            // Should load within reasonable time (adjust threshold as needed)
            expect(loadTime).toBeLessThan(5000); // 5 seconds
        });

        test('tab switching is responsive', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            await waitFor(() => {
                expect(screen.getByText('Lab Management Overview')).toBeInTheDocument();
            });

            const startTime = performance.now();

            // Switch between tabs quickly
            fireEvent.click(screen.getByText('Inventory'));
            await waitFor(() => {
                expect(screen.getByText('Inventory Management')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Equipment'));
            await waitFor(() => {
                expect(screen.getByText('Equipment Management')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Quality Control'));
            await waitFor(() => {
                expect(screen.getByText('Quality Control Tests')).toBeInTheDocument();
            });

            const endTime = performance.now();
            const switchTime = endTime - startTime;

            // Tab switching should be fast
            expect(switchTime).toBeLessThan(2000); // 2 seconds
        });
    });

    describe('Error Handling Integration', () => {
        test('handles API errors gracefully across modules', async () => {
            // Mock API error
            const mockApiClient = require('@/api/mockApiClient').mockApiClient;
            mockApiClient.entities.LabOrder.list.mockRejectedValue(new Error('API Error'));

            renderWithQueryClient(<LaboratoryManagement />);

            await waitFor(() => {
                // Should still render the component even with API errors
                expect(screen.getByText('Lab Management Overview')).toBeInTheDocument();
            });
        });

        test('form validation works consistently across modules', async () => {
            renderWithQueryClient(<LaboratoryManagement />);

            // Test inventory form validation
            fireEvent.click(screen.getByText('Inventory'));

            await waitFor(() => {
                const addButton = screen.getByText('Add Item');
                fireEvent.click(addButton);
            });

            const saveButton = screen.getByText('Save Item');
            fireEvent.click(saveButton);

            // Should show validation errors
            expect(screen.getByLabelText('Item Name *')).toBeInTheDocument();
        });
    });
});
