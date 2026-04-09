import { useState, useEffect } from 'react';
import { Land } from './types.ts';

export const useLands = () => {
  const [lands, setLands] = useState<Land[]>([]);
  useEffect(() => {
    import('@hellfall/shared/data/lands.json').then(({ data }: any) => {
      setLands(data);
    });
  }, []);
  return lands;
};
