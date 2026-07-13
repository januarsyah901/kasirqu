import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import api from '../api/axios';
import { LanguageProvider } from '../auth/LanguageContext';
import Inventory from '../components/Inventory';

vi.mock('../api/axios');

beforeEach(() => {
  api.get.mockImplementation(() => Promise.resolve({ data: { data: { data: [] } } }));
  api.post.mockResolvedValue({ data: { message: 'ok' } });
});

test('renders inventory page and loads data', async () => {
  render(<LanguageProvider><MemoryRouter><Inventory /></MemoryRouter></LanguageProvider>);
  await waitFor(() => expect(api.get).toHaveBeenCalledWith('/inventory'));
  expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
});
