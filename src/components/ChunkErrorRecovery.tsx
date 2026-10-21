'use client';

import { useEffect } from 'react';

/**
 * Handles ChunkLoadError across deployments.
 * If a deployment happens while a user has a tab open or edge served stale HTML,
 * automatically reloads the page to get the fresh chunks without showing an error screen.
 */
export default function ChunkErrorRecovery() {
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      const msg = e?.message || '';
      if (
        msg.includes('ChunkLoadError') ||
        msg.includes('Failed to load chunk') ||
        msg.includes('Loading chunk') ||
        msg.includes('is not executable')
      ) {
        try {
          const key = 'hwb_last_chunk_reload';
          const now = Date.now();
          const last = parseInt(sessionStorage.getItem(key) || '0', 10);
          if (now - last > 8000) {
            sessionStorage.setItem(key, now.toString());
            window.location.reload();
          }
        } catch (_) {
          window.location.reload();
        }
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return null;
}
