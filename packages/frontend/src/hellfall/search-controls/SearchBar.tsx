import { TextInput, space, styled } from '@workday/canvas-kit-react';
import { useAtom } from 'jotai';
import { pageAtom, queryAtom } from '../atoms/searchAtoms';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { normalizeText } from '@hellfall/shared/utils';
import { createStyles } from '@workday/canvas-kit-styling';

export const SearchBar = ({ alreadyOnSearch }: { alreadyOnSearch?: boolean }) => {
  const navigate = useNavigate();
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
      <div className={containerStyles}>
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
        <div className={spacer} />
        <Link to={'/syntax'}>search syntax</Link>
      </div>
    </>
  );
};
// const Spacer = styled('div')({
//   height: '5px',
// });
const spacer = createStyles({
  height: '5px',
});
const containerStyles = createStyles({
  paddingLeft: space.l,
  paddingRight: space.l,
  marginTop: '-10px',
  marginBottom: '0px',
  overflow: 'hidden',
})
// const Container = styled('div')({
//   paddingLeft: space.l,
//   paddingRight: space.l,
//   marginTop: '-10px',
//   marginBottom: '0px',
//   overflow: 'hidden',
// });
// const searchBoxStyles = createStyles({
//   overflow: 'hidden',
//   // border: 'none',
// })
const SearchBox = styled(TextInput)({
  overflow: 'hidden',
  // border: 'none',
});
