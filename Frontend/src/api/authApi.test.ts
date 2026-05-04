import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, loginPublic, register } from './authApi';

describe('authApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('login should return AuthResponse on success', async () => {
    const mockResponse = { token: 'abc', userId: 1, userName: 'testuser' };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await login({ email: 'test@test.com', password: 'password' });

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/Auth/login'), expect.any(Object));
  });

  it('login should throw error on failure', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
    });

    await expect(login({ email: 'wrong@test.com', password: 'wrong' }))
      .rejects.toThrow('Credenciales inválidas');
  });

  it('loginPublic should call join endpoint', async () => {
    const mockResponse = { id: 10, codEvento: 1234, nombre: 'Evento Test' };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await loginPublic('1234');

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/Eventos/join?pin=1234'), expect.any(Object));
  });

  it('register should return data on success', async () => {
    const mockResponse = { token: 'new-token' };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await register({ email: 'new@test.com', password: 'pass', nombreCompleto: 'New User' });

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/Auth/register'), expect.any(Object));
  });
});
