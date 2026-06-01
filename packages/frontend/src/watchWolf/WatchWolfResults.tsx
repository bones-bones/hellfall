import styled from '@emotion/styled';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { cardsAtom } from '../hellfall/atoms/cardsAtom.ts';
import { useEffect, useMemo, useState } from 'react';
import { TeamWolf as GetCardVotes } from './TeamWolf.tsx';
import { activeCardAtom } from '../hellfall/atoms/searchAtoms.ts';
import { ActiveCardPanel } from '../hellfall/ActiveCardPanel.tsx';

interface Standing {
  Id: string;
  Wins: number;
  Matches: number;
  Winrate?: string;
}

export const Watchwolfresults = () => {
  const cards = useAtomValue(cardsAtom).filter(e => e.set != 'NRM');
  const setActiveCardFromAtom = useSetAtom(activeCardAtom);
  const [standings, setStandings] = useState<Standing[]>();
  useEffect(() => {
    GetCardVotes().then(setStandings);
  }, []);

  const wrGroupedStandings = useMemo(() => {
    if (!standings) return [];
    // first we create an object where the keys are winrates and the values are arrays of standings.
    const buckets = standings.reduce<Record<string, Standing[]>>((accumulator, standing) => {
      const winrate = ((standing.Wins / standing.Matches) * 100).toFixed(0);
      if (!(winrate in accumulator)) {
        // this winrate does not exist in the accumulator object yet,
        // lets create an empty array under its key.
        accumulator[winrate] = [];
      }
      accumulator[winrate].push({ ...standing, Winrate: winrate });
      return accumulator;
    }, {});
    // then we sort all value arrays so we dont have to do it at render
    for (const wrKey in buckets) {
      const wr = Number(wrKey);
      buckets[wrKey].sort((a, b) => {
        // if wr >= 50, we want to sort by wins descending
        if (wr >= 50) {
          return b.Wins - a.Wins;
        }
        // if wr < 50, we want to sort by matches - wins (losses) ascending
        return a.Matches - a.Wins - (b.Matches - b.Wins);
      });
    }
    // then we sort the keys so we can iterate over them in order
    const sortedKeys = Object.keys(buckets).sort((a, b) => Number(b) - Number(a));
    // and last we flatten the buckets into a single array
    const flattened = sortedKeys.flatMap(key => buckets[key]);
    return flattened;
  }, [standings]);

  return (
    <PageContainer>
      <title>WatchWolfWar Results | Hellfall</title>
      <ActiveCardPanel />
      <StyleComponent>
        <Title>
          Welcome to the WatchWolfWar, the place to be to determine the Hellsiest card of All!
        </Title>
      </StyleComponent>
      <StyleComponent>
        <Subtitle>
          Here are the results! Do not be too sad if you are at the bottom. It is okay. The Licensed
          Hellscube Therapist is always here to help.
        </Subtitle>
      </StyleComponent>
      <StyleComponent>
        <ResultsReceptaclePlaceThing>
          {/* Header row, but we just re-use the ResultRow component */}
          <ResultRow style={{ marginBottom: 6 }}>
            <div>
              <strong>Card Name</strong> [Creator]
            </div>
            <span>Winrate</span>
            <span>W/L</span>
          </ResultRow>

          {wrGroupedStandings?.slice(0, cards.size()).map(entry => {
            const card = cards.get(entry.Id);
            if (!card) return null;

            return (
              <ResultRow
                key={entry.Id}
                href={`/card/${encodeURIComponent(card.hcid)}`}
                onClick={(event: React.MouseEvent) => {
                  if (event.button === 1 || event.metaKey || event.ctrlKey) {
                    window.open(`/card/${encodeURIComponent(card.hcid)}`, '_blank');
                  } else {
                    event.preventDefault();
                    setActiveCardFromAtom(card.id);
                  }
                }}
              >
                <div>
                  <strong>{card.name}</strong> [{card.creators.join(', ')}]
                </div>
                <span>{entry.Winrate}%</span>
                <span>
                  {entry.Wins}/{entry.Matches}
                </span>
              </ResultRow>
            );
          })}
        </ResultsReceptaclePlaceThing>
      </StyleComponent>
    </PageContainer>
  );
};

const PageContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '40px',
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#f9f9f9',
  minHeight: '100vh',
});
const Title = styled('h1')({ textAlign: 'center', marginBottom: '10px' });
const Subtitle = styled('h3')({ textAlign: 'center', marginBottom: '30px' });
const ResultsReceptaclePlaceThing = styled('div')({
  width: '100%',
  maxWidth: '600px',
  padding: '8px 0px',
  backgroundColor: '#f0f0f0',
  border: '1px solid #ccc',
  boxShadow: '0 2px 8px rgb(164, 45, 168)',
  textAlign: 'center',
});
const ResultRow = styled('a')({
  display: 'flex',
  gap: '8px',
  cursor: 'pointer',
  padding: '0px 16px',

  '&:hover': {
    textDecoration: 'underline',
  },

  '&:nth-child(odd)': {
    backgroundColor: '#f0f0f0',
  },

  '&:nth-child(even)': {
    backgroundColor: '#e0e0e0',
  },

  '& > div': {
    flex: 1,
    textAlign: 'left',
  },
});

const StyleComponent = styled('div')({ color: 'purple', display: 'flex' });
