import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import POSScreen from '../components/POSScreen';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import api from '../api/axios';

const mockProducts = {
  data: {
    data: [
      { item_id: 1, name: 'Kopi Susu', unit_price: 15000, cost_price: 10000, item_number: 'P001', quantities: [{ location_id: 1, quantity: 50 }] },
      { item_id: 2, name: 'Teh Manis', unit_price: 10000, cost_price: 7000, item_number: 'P002', quantities: [{ location_id: 1, quantity: 30 }] },
      { item_id: 3, name: 'Nasi Goreng', unit_price: 25000, cost_price: 18000, item_number: 'P003', quantities: [{ location_id: 1, quantity: 20 }] },
    ],
  },
};

describe('POSScreen Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue(mockProducts);
    api.post.mockResolvedValue({ data: { data: {}, message: 'ok' } });
  });

  const renderPOS = () => {
    return render(
      <BrowserRouter>
        <POSScreen />
      </BrowserRouter>
    );
  };

  it('renders POS title', async () => {
    renderPOS();
    expect(screen.getByText('Point of Sale')).toBeInTheDocument();
  });

  it('fetches and displays product grid', async () => {
    renderPOS();
    await waitFor(() => expect(screen.getByText('Kopi Susu')).toBeInTheDocument());
    expect(screen.getByText('Nasi Goreng')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/products');
  });

  it('adds product to cart when clicked', async () => {
    renderPOS();
    const product = await screen.findByText('Kopi Susu');
    fireEvent.click(product.closest('button'));
    expect(screen.getAllByText('Kopi Susu').length).toBeGreaterThan(1);
  });

  it('shows empty cart message initially', async () => {
    renderPOS();
    await waitFor(() => expect(screen.getByText('Kopi Susu')).toBeInTheDocument());
    expect(screen.getByText('Cart is empty')).toBeInTheDocument();
  });

  it('calculates total correctly and posts sale', async () => {
    renderPOS();
    const kopiSusu = await screen.findByText('Kopi Susu');
    fireEvent.click(kopiSusu.closest('button'));

    const totals = await screen.findAllByText(/Rp 15,000/);
    expect(totals.length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Checkout'));
    fireEvent.click(screen.getByText('Cash'));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/sales', expect.objectContaining({
      employee_id: 1,
      payments: [{ payment_type: 'Cash', payment_amount: 15000 }],
    })));
  });
});
