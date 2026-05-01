import { renderHook, waitFor } from '@testing-library/react';
import { useFingerprint } from './useFingerprint';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock FingerprintJS
vi.mock('@fingerprintjs/fingerprintjs', () => ({
  default: {
    load: vi.fn().mockResolvedValue({
      get: vi.fn().mockResolvedValue({
        visitorId: 'mock-visitor-id'
      })
    })
  }
}));

describe('useFingerprint', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return a visitorId from FingerprintJS', async () => {
    const { result } = renderHook(() => useFingerprint());

    // isLoading might be false immediately if the mock resolves too fast, 
    // but usually it starts as true.
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.fingerprint).toBe('mock-visitor-id');
  });

  it('should fallback to localStorage if FingerprintJS fails', async () => {
    const { default: fpjs } = await import('@fingerprintjs/fingerprintjs');
    (fpjs.load as any).mockRejectedValueOnce(new Error('FPJS failed'));

    const { result } = renderHook(() => useFingerprint());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.fingerprint).toMatch(/^ls-/);
    const stored = localStorage.getItem('votify-fallback-id');
    expect(result.current.fingerprint).toBe(stored);
  });
});
