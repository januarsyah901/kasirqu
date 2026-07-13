import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import api from '../api/axios';
import { LanguageProvider } from '../auth/LanguageContext';
import Receivings from '../components/Receivings';

vi.mock('../api/axios');

beforeEach(() => {
  api.get.mockImplementation(() => Promise.resolve({ data: { data: { data: [] } } }));
  api.post.mockResolvedValue({ data: { message: 'ok' } });
});

test('renders receivings page and loads data', async () => {
  render(<LanguageProvider><MemoryRouter><Receivings /></MemoryRouter></LanguageProvider>);
  await waitFor(() => expect(api.get).toHaveBeenCalledWith('/receivings'));
  expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
});
