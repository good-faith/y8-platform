import { useEffect } from 'react';

export function Auth() {
  useEffect(() => { document.title = 'Sign In | The Beach'; }, []);

  return null;
}
