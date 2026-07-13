import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../components/Dashboard';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import api from '../api/axios';

const mockSummary = {
  data: {
    data: {
      report_type: 'summary',
      rows: [
        { sales_count: 12, total_paid: 1250000 },
        { top_products: [{ item_id: 1, name: 'Kopi', unit_price: 15000 }, { item_id: 2, name: 'Teh', unit_price: 10000 }] },
      ],
      totals: { sales_count: 12, total_paid: 1250000 },
    },
  },
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue(mockSummary);
  });

  it('renders dashboard title', async () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays stat cards after fetch', async () => {
    render(<Dashboard />);
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/reports/summary'));
    expect(screen.getByText("Today's Sales")).toBeInTheDocument();
    expect(screen.getByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  it('shows formatted sales value', async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Rp 1,250,000')).toBeInTheDocument());
    expect(screen.getByText(2)).toBeInTheDocument();
  });

  it('shows recent sales section', async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Recent Sales')).toBeInTheDocument());
  });
});
