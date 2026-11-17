import { useEffect, useState } from 'react';

// Phone = below Carbon md (42rem). Shared by every component that changes layout by viewport.
export const PHONE_QUERY = '(max-width: 41.98rem)';

function canMatch(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

// Without matchMedia (jsdom, very old browsers) the answer is "not a phone".
export function useIsPhone(): boolean {
  const [phone, setPhone] = useState<boolean>(() => canMatch() && window.matchMedia(PHONE_QUERY).matches);

  useEffect(() => {
    if (!canMatch()) return undefined;
    const query = window.matchMedia(PHONE_QUERY);
    const onChange = () => setPhone(query.matches);
    onChange();
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return phone;
}
