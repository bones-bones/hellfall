import { createStyles } from '@workday/canvas-kit-styling';
import { useAuth } from './AuthContext';
import { createStyledDiv, createStyledHR, createStyledPrimaryButton } from '../styling';
import { getAuthApiUrl } from './getAuthApiUrl';
import { Link, useNavigate } from 'react-router-dom';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { ControlBar } from '../hellfall/search-controls/ControlBar';
import { Box, ButtonColors } from '@workday/canvas-kit-react';
import { system } from '@workday/canvas-tokens-web';
import { useAtom } from 'jotai';
import { inputSortAtom, sortAtom } from '../hellfall/atoms/searchAtoms';
import { inclusionType, parseSorts } from '@hellfall/shared/filters';
import { SelectItems, StyledSelect } from '../hellfall/search-controls/StyledSelect';

type filterChoice = 'include' | 'exclude' | 'auto';
const OPTIONS: SelectItems<filterChoice> = [
  { label: 'Automatically', value: 'auto' },
  { label: 'Always', value: 'include' },
  { label: 'Never', value: 'exclude' },
];
// const FilterOption = ({title, filter, value, noAlways, index}:{title:string; filter:inclusionType; value:filterChoice; noAlways?:boolean, index:number}) => {
//   const getAvailableValues = () => OPTIONS.flatMap(opt => opt.value == 'include' && noAlways ? [] : opt.value)

//   return (
//     <StyledSelect<filterChoice>>

//     </>
//   );

// }

export const Settings = () => {
  const { user, loading } = useAuth();
  const authConfigured = !!getAuthApiUrl();
  const navigate = useNavigate();
  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  const [sortRules, setSortRules] = useAtom(sortAtom);
  const [cardsChoice, setCardsChoice] = useState<filterChoice>('auto');
  const [tokensChoice, setTokensChoice] = useState<filterChoice>('auto');
  const [vetoChoice, setVetoChoice] = useState<filterChoice>('auto');

  useEffect(() => {
    setInputSorts(['auto,auto']);
    setSortRules([]);
  }, []);
  useEffect(() => {
    setSortRules(parseSorts(inputSorts));
  }, [inputSorts]);


  useEffect(() => {
    const handleRedirect = async () => {
      if (!user && !loading) {
        navigate('/login', { replace: true });
        return;
      }
    };

    handleRedirect();
  }, [user, loading]);

  if (!authConfigured) {
    return (
      <PageContainer>
        <title>Settings | Hellfall</title>
        <p>Login is not configured. Set REACT_APP_AUTH_API_URL to enable Discord login.</p>
        <Link to="/">Back to search</Link>
      </PageContainer>
    );
  }
  if (loading) {
    return (
      <PageContainer>
        <title>Settings Loading | Hellfall</title>
        <p>…</p>
      </PageContainer>
    );
  }
  if (!user) {
    return (
      <PageContainer>
        <title>Settings | Hellfall</title>
        <p>Not logged in.</p>
        <Link to="/">Back to search</Link>
      </PageContainer>
    );
  }
  return (
    <PageContainer>
      <title>Settings | Hellfall</title>
      <h2>Display Options</h2>
      <div>
        Choose default options for your Hellfall searches. While signed in, if you do not
        specifically choose search options these defaults will be used instead.{' '}
      </div>
      <br />
      <ControlBar noLabel={true} />
      <ButtonContainer>
        <Button
          colors={inputButtonColors}
          onClick={() => {
            const x = 1;
          }}
        >
          Update display preferences
        </Button>
      </ButtonContainer>
      <Separator />
      <h2>Filter Options</h2>
      <div>
        Override Hellfall's default search filtering and retry behavior. Please note: Some of these
        options may drastically reduce the number of results you receive for certain searches.
      </div>
      <br />
      <FilterContainer>
        <FilterOption>Include extra cards: </FilterOption>
        <StyledSelect<filterChoice>
          key="cards"
          items={OPTIONS}
          initialValue={cardsChoice}
          width="150px"
          title="Whether to include extra cards"
          onSelect={setCardsChoice}
        />
        <FilterOption>Include tokens: </FilterOption>
        <StyledSelect<filterChoice>
          key="tokens"
          items={OPTIONS}
          initialValue={tokensChoice}
          width="150px"
          title="Whether to include tokens"
          onSelect={setTokensChoice}
        />
        <FilterOption>Include vetoed cards: </FilterOption>
        <StyledSelect<filterChoice>
          key="veto"
          items={OPTIONS}
          initialValue={vetoChoice}
          width="150px"
          title="Whether to include vetoed cards"
          onSelect={setVetoChoice}
        />
      </FilterContainer>
      <br />
      <Button
        colors={inputButtonColors}
        onClick={() => {
          const x = 1;
        }}
      >
        Update filter preferences
      </Button>
    </PageContainer>
  );
};
const bigContainerE = createStyles({
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: 'lightgrey',
  minHeight: '95vh',
});

const innerContainer = createStyles({
  width: '80vw',
  backgroundColor: 'white',
  padding: '20px',
});
const PageContainer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box cs={bigContainerE}>
      <Box cs={innerContainer}>{children}</Box>
    </Box>
  );
};

// const pageContainerStyles = createStyles({
//   // maxWidth: 900,
//   // margin: '0 auto',
//   // padding: '20px 16px',
//    display: 'block', justifyContent: 'center'
// });
// const PageContainer = createStyledDiv(pageContainerStyles, 'PageContainer');

const buttonContainerStyles = createStyles({
  marginTop: '-20px',
});
const ButtonContainer = createStyledDiv(buttonContainerStyles);

const FilterOption = Box;
const buttonStyles = createStyles({
  marginLeft: '0px',
  // marginBottom: '15px',
  borderRadius: '4px',
  textDecoration: 'none',
  '&:hover, &:focus, &:active': {
    textDecoration: 'none',
  },
});
const Button = createStyledPrimaryButton(buttonStyles, 'Button');

const filterContainerStyles = createStyles({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: '8px',
  alignItems: 'center',
  marginBottom: '-11px',
});
const FilterContainer = createStyledDiv(filterContainerStyles);

const inputButtonColors: ButtonColors = {
  default: {
    background: system.color.bg.default,
    border: system.color.border.input.default,
    label: system.color.fg.default,
  },
  hover: {
    background: system.color.surface.raised,
    border: system.color.brand.border.primary,
    label: system.color.fg.default,
  },
  active: {
    background: system.color.bg.default,
    border: system.color.border.input.default,
    label: system.color.fg.default,
  },
  focus: {
    background: system.color.surface.raised,
    border: system.color.brand.border.primary,
    label: system.color.fg.default,
  },
  disabled: {
    background: system.color.surface.raised,
    border: system.color.fg.disabled,
    label: system.color.fg.default,
  },
};
const sortSeparatorStyles = createStyles({
  height: '1px',
  backgroundColor: '#ccc',
  border: 'none',
  marginTop: '-20px',
});
const SortSeparator = createStyledHR(sortSeparatorStyles, 'SortSeparator');
const separatorStyles = createStyles({ height: '1px', backgroundColor: '#ccc', border: 'none' });
const Separator = createStyledHR(separatorStyles, 'Separator');
