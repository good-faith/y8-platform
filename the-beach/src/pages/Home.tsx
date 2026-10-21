import { useEffect } from 'react';

export function Home() {
  useEffect(() => { document.title = 'Home | The Beach'; }, []);

  return null;
}
