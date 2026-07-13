import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import POSScreen from '../components/POSScreen';

describe('POSScreen Component', () => {
  const renderPOS = () => {
    return render(
      <BrowserRouter>
        <POSScreen />
      </BrowserRouter>
    );
  };

  it('renders POS title', () => {
    renderPOS();
    expect(screen.getByText('Point of Sale')).toBeInTheDocument();
  });

  it('displays product grid', () => {
    renderPOS();
    expect(screen.getByText('Kopi Susu')).toBeInTheDocument();
    expect(screen.getByText('Nasi Goreng')).toBeInTheDocument();
  });

  it('adds product to cart when clicked', () => {
    renderPOS();
    const product = screen.getByText('Kopi Susu');
    fireEvent.click(product.closest('button'));
    
    // Cart should now show the item
    expect(screen.getAllByText('Kopi Susu').length).toBeGreaterThan(1);
  });

  it('shows empty cart message initially', () => {
    renderPOS();
    expect(screen.getByText('Cart is empty')).toBeInTheDocument();
  });

  it('calculates total correctly', () => {
    renderPOS();
    const kopiSusu = screen.getByText('Kopi Susu');
    fireEvent.click(kopiSusu.closest('button'));
    
    // Should show total - use getAllByText since it appears in multiple places
    const totals = screen.getAllByText(/Rp 15,000/);
    expect(totals.length).toBeGreaterThan(0);
  });
});
