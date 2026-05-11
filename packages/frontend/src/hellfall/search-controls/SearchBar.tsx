import { FormField, TextInput } from '@workday/canvas-kit-react';
import { useAtom } from 'jotai';
import { queryAtom } from '../atoms/searchAtoms';
import { useEffect, useState } from 'react';
import { useKeyPress } from '../../hooks';

export const SearchBar = () => {
  const [query, setQuery] = useAtom(queryAtom);
  const [localQuery, setLocalQuery] = useState(query);
  const enterPressed = useKeyPress('Enter');
  useEffect(() => {
    if (enterPressed) {
      setQuery(localQuery);
    }
  }, [enterPressed]);

  useEffect(() => {
    if (localQuery != query) {
      setLocalQuery(query);
    }
  }, [query]);

  return (
    <>
      <TextInput
        width="80%"
        value={localQuery}
        onChange={event => setLocalQuery(event.target.value)}
      />
    </>
  );
};
