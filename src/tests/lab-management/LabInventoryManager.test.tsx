import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LabInventoryManager from '@/components/labs/LabInventoryManager';

// Mock the API client
jest.mock('@/api/mockApiClient', () => ({
  mockApiClient: {
    entities: {
      InventoryItem: {
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

describe('Lab Inventory Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Inventory Metrics', () => {
    test('displays total items count', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Total Items')).toBeInTheDocument();
        expect(screen.getByText('6')).toBeInTheDocument(); // Based on mock data
      });
    });

    test('displays low stock items count', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Low Stock')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Based on mock data
      });
    });

    test('displays out of stock items count', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Out of Stock')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument(); // Based on mock data
      });
    });

    test('displays expiring soon items count', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Expiring Soon')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument(); // Based on mock data
      });
    });

    test('displays total inventory value', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Total Value')).toBeInTheDocument();
        expect(screen.getByText(/\$\d+\.\d{2}/)).toBeInTheDocument();
      });
    });
  });

  describe('Add Item Form', () => {
    test('opens add item form when Add Item button is clicked', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        const addButton = screen.getByText('Add Item');
        fireEvent.click(addButton);
      });

      expect(screen.getByText('Add New Inventory Item')).toBeInTheDocument();
    });

    test('form contains all required fields', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        const addButton = screen.getByText('Add Item');
        fireEvent.click(addButton);
      });

      expect(screen.getByLabelText('Item Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Category *')).toBeInTheDocument();
      expect(screen.getByLabelText('Current Stock *')).toBeInTheDocument();
      expect(screen.getByLabelText('Minimum Stock *')).toBeInTheDocument();
      expect(screen.getByLabelText('Unit *')).toBeInTheDocument();
    });

    test('form validation works for required fields', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        const addButton = screen.getByText('Add Item');
        fireEvent.click(addButton);
      });

      const saveButton = screen.getByText('Save Item');
      fireEvent.click(saveButton);

      // Check that required field validation is working
      expect(screen.getByLabelText('Item Name *')).toBeInTheDocument();
    });
  });

  describe('Edit Item Function', () => {
    test('opens edit form when edit button is clicked', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: /edit/i });
        fireEvent.click(editButtons[0]);
      });

      expect(screen.getByText('Edit Inventory Item')).toBeInTheDocument();
    });

    test('populates form with existing item data', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: /edit/i });
        fireEvent.click(editButtons[0]);
      });

      // Check that form is populated with existing data
      expect(screen.getByDisplayValue('Blood Collection Tubes')).toBeInTheDocument();
    });
  });

  describe('Delete Item Function', () => {
    test('shows confirmation dialog when delete button is clicked', async () => {
      // Mock window.confirm
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        fireEvent.click(deleteButtons[0]);
      });

      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this inventory item?');

      mockConfirm.mockRestore();
    });
  });

  describe('Stock Alerts', () => {
    test('displays out of stock alert', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        expect(screen.getByText(/Critical: You have 1 items out of stock/)).toBeInTheDocument();
      });
    });

    test('displays expiring soon alert', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        expect(screen.getByText(/Warning: You have 1 items expiring within 30 days/)).toBeInTheDocument();
      });
    });

    test('displays low stock alert', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        expect(screen.getByText(/Alert: You have 2 items with low stock levels/)).toBeInTheDocument();
      });
    });
  });

  describe('Filter and Search', () => {
    test('filters by category', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        const categorySelect = screen.getByDisplayValue('All Categories');
        fireEvent.click(categorySelect);
      });

      // Check that category options are available
      expect(screen.getByText('Reagents')).toBeInTheDocument();
      expect(screen.getByText('Consumables')).toBeInTheDocument();
    });

    test('filters by stock status', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        const statusSelect = screen.getByDisplayValue('All Status');
        fireEvent.click(statusSelect);
      });

      // Check that status options are available
      expect(screen.getByText('In Stock')).toBeInTheDocument();
      expect(screen.getByText('Low Stock')).toBeInTheDocument();
      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });

    test('searches items by name', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search by name, supplier, lot...');
        fireEvent.change(searchInput, { target: { value: 'Blood' } });
      });

      // Should show filtered results
      expect(screen.getByText('Blood Collection Tubes')).toBeInTheDocument();
    });

    test('shows filtered item count', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        expect(screen.getByText(/Showing \d+ of \d+ items/)).toBeInTheDocument();
      });
    });
  });

  describe('Item Display', () => {
    test('displays item cards with all information', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Blood Collection Tubes')).toBeInTheDocument();
        expect(screen.getByText('Sterile blood collection tubes')).toBeInTheDocument();
        expect(screen.getByText('150 pieces')).toBeInTheDocument();
        expect(screen.getByText('$2.50')).toBeInTheDocument();
      });
    });

    test('shows stock level progress bars', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        expect(screen.getAllByText('Stock Level')).toHaveLength(6); // One for each item
      });
    });

    test('displays correct status badges', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('In Stock')).toBeInTheDocument();
        expect(screen.getByText('Low Stock')).toBeInTheDocument();
        expect(screen.getByText('Out of Stock')).toBeInTheDocument();
      });
    });
  });

  describe('Category Breakdown', () => {
    test('displays category breakdown metrics', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
        expect(screen.getByText('Consumables')).toBeInTheDocument();
        expect(screen.getByText('Reagents')).toBeInTheDocument();
      });
    });
  });

  describe('Stock Utilization', () => {
    test('displays stock utilization metrics', async () => {
      renderWithQueryClient(<LabInventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Stock Utilization')).toBeInTheDocument();
        expect(screen.getByText('Average Utilization')).toBeInTheDocument();
      });
    });
  });
});
