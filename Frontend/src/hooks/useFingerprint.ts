import { useState, useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export function useFingerprint() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function getFingerprint() {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprint(result.visitorId);
      } catch (e) {
        console.error('FingerprintJS failed, falling back to LocalStorage:', e);
        setError(e as Error);
        
        // Fallback to LocalStorage
        let fallbackId = localStorage.getItem('votify-fallback-id');
        if (!fallbackId) {
          fallbackId = 'ls-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          localStorage.setItem('votify-fallback-id', fallbackId);
        }
        setFingerprint(fallbackId);
      } finally {
        setIsLoading(false);
      }
    }

    getFingerprint();
  }, []);

  return { fingerprint, isLoading, error };
}
