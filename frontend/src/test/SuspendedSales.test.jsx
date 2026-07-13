import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SuspendedSales from '../components/SuspendedSales';

vi.mock('../api/axios', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('../auth/LanguageContext', () => ({
  useLanguage: () => ({ t: (k) => k }),
  LanguageProvider: ({ children }) => children,
}));

import api from '../api/axios';

describe('SuspendedSales Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: [] } });
    api.post.mockResolvedValue({ data: { data: {}, message: 'ok' } });
  });

  const renderPage = () => render(<BrowserRouter><SuspendedSales /></BrowserRouter>);

  it('renders title', async () => {
    renderPage();
    expect(await screen.findByText('suspended.title')).toBeInTheDocument();
  });
});
