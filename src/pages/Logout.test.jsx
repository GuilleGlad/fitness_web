import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Logout from './Logout';

jest.mock('axios');
const mockedAxios = axios;

describe('Logout', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedAxios.post.mockReset();
  });

  it('clears session data and redirects to login', async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });

    localStorage.setItem('token', 'abc');
    localStorage.setItem('role', '1');
    localStorage.setItem('name', 'Test User');
    localStorage.setItem('client_id', '42');
    localStorage.setItem('status', '1');

    render(
      <MemoryRouter initialEntries={['/auth/logout']}>
        <Routes>
          <Route path="/auth/logout" element={<Logout />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/Login Page/i)).toBeInTheDocument());

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
    expect(localStorage.getItem('name')).toBeNull();
    expect(localStorage.getItem('client_id')).toBeNull();
    expect(localStorage.getItem('status')).toBeNull();
    expect(mockedAxios.post).toHaveBeenCalled();
  });
});
