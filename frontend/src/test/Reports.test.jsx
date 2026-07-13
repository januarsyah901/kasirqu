import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Reports from '../components/Reports';

vi.mock('../api/axios', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('../auth/LanguageContext', () => ({
  useLanguage: () => ({ t: (k) => k }),
  LanguageProvider: ({ children }) => children,
}));

import api from '../api/axios';

describe('Reports Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: { rows: [], totals: {} } } });
    api.post.mockResolvedValue({ data: { data: {}, message: 'ok' } });
  });

  const renderPage = () => render(<BrowserRouter><Reports /></BrowserRouter>);

  it('renders title', async () => {
    renderPage();
    expect(await screen.findByText('reports.title')).toBeInTheDocument();
  });

  it('renders report tabs', async () => {
    renderPage();
    expect(await screen.findByText('reports.tabSales')).toBeInTheDocument();
    expect(await screen.findByText('reports.tabInventory')).toBeInTheDocument();
    expect(await screen.findByText('reports.tabExpenses')).toBeInTheDocument();
  });
});
