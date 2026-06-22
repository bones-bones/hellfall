import { useAtom } from 'jotai';
import { pageAtom, queryAtom } from '../atoms/searchAtoms';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { normalizeText } from '@hellfall/shared/utils';
import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledDiv, createStyledTextInput } from '../../styling';

export const SearchBar = ({ alreadyOnSearch }: { alreadyOnSearch?: boolean }) => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const maxWidth = useMemo(() => {
    return windowWidth - 2 * 36;
  }, [windowWidth]);

  const [query, setQuery] = useAtom(queryAtom);
  const [localQuery, setLocalQuery] = useState(query == '*' && !alreadyOnSearch ? '' : query);
  const [page, setPage] = useAtom(pageAtom);

  useEffect(() => {
    if (localQuery != query && !(query == '*' && !alreadyOnSearch)) {
      setLocalQuery(query);
    }
  }, [query]);

  const handleSubmit = (formData: FormData) => {
    const searchQuery = formData.get('search') as string;
    if (alreadyOnSearch) {
      setQuery(normalizeText(searchQuery));
      setPage(0);
    } else {
      navigate(`/?q=${encodeURIComponent(query)}`, { replace: false });
    }
  };

  return (
    <>
      <Container>
        <form action={handleSubmit}>
          <SearchBox
            width={maxWidth}
            placeholder="Search for Hellscube cards..."
            value={localQuery}
            onChange={event => setLocalQuery(event.target.value)}
            name="search"
            enterKeyHint="search"
          />
        </form>
        <Spacer />
        <Link to={'/syntax'}>search syntax</Link>
      </Container>
    </>
  );
};
const spacerStyles = createStyles({
  height: '5px',
});
const Spacer = createStyledDiv(spacerStyles);

const containerStyles = createStyles({
  paddingLeft: '36px',
  paddingRight: '36px',
  marginTop: '-10px',
  marginBottom: '0px',
  overflow: 'hidden',
});
const Container = createStyledDiv(containerStyles);

const searchBoxStyles = createStyles({
  overflow: 'hidden',
  // border: 'none',
});
const SearchBox = createStyledTextInput(searchBoxStyles);
