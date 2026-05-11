import { FormField, TextInput, space, styled } from '@workday/canvas-kit-react';
import { useAtom } from 'jotai';
import { queryAtom } from '../atoms/searchAtoms';
import { useEffect, useMemo, useState } from 'react';
import { useKeyPress } from '../../hooks';

export const SearchBar = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const maxWidth = useMemo(() => {
    return windowWidth - 2 * parseInt(space.l);
  }, [windowWidth]);

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
      <Container>
        <TextInput
          width={maxWidth}
          placeholder="Search for Hellscube cards..."
          value={localQuery}
          onChange={event => setLocalQuery(event.target.value)}
        />
      </Container>
    </>
  );
};
const Container = styled('div')({ paddingLeft: space.l, paddingRight: space.l, width: '100%' });
