import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthProvider } from '../context/AuthContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import * as authApi from '../api/authApi';
import { toast } from 'sonner';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );

  it('should handle successful login', async () => {
    const mockUser = { token: 'token-123', userId: 1, userName: 'Test User' };
    vi.spyOn(authApi, 'login').mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: 'test@test.com', password: 'password' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.userName).toBe('Test User');
    expect(toast.success).toHaveBeenCalledWith('¡Bienvenido!');
    expect(mockNavigate).toHaveBeenCalledWith('/eventos');
    expect(localStorage.getItem('token')).toBe('token-123');
  });

  it('should handle login failure', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue(new Error('Auth failed'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login({ email: 'wrong@test.com', password: 'wrong' });
      } catch (e) {
        // expected
      }
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Auth failed');
  });

  it('should handle logout', async () => {
    localStorage.setItem('token', 'old-token');
    
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });
});
