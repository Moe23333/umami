import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { setClientAuthToken } from 'lib/client';

export default function SingleSignOnPage() {
  const router = useRouter();
  const { token, url } = router.query;

  useEffect(() => {
    if (url && token) {
      setClientAuthToken(token);

      router.push(url);
    }
  }, [router, url, token]);

  return null;
}
