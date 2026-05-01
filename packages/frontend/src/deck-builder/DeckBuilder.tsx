import { useEffect, useRef, useState } from 'react';
import { downloadElementAsImage } from './download-image';
import { HCCard } from '@hellfall/shared/types';
import styled from '@emotion/styled';
import { toDeck } from './toDeck.ts';
import { TextInput, FormField } from '@workday/canvas-kit-react';
import { ImportInstructions } from './ImportInstructions.tsx';
import { PlaytestArea } from './playtest/PlaytestArea.tsx';
import { nameToId } from '../hellfall/hooks/useNameToId.ts';
import { getDraftmancerForCube } from '../hells-cubes/draftmancer/getDraftmancerForCube.ts';

const basics: Record<string, string> = {
  forest: 'https://ist7-1.filesor.com/pimpandhost.com/2/6/5/8/265896/f/w/x/n/fwxn0/forest.jpeg',
  swamp: 'https://ist7-1.filesor.com/pimpandhost.com/2/6/5/8/265896/f/w/x/m/fwxmZ/swamp.jpeg',
  island: 'https://ist7-1.filesor.com/pimpandhost.com/2/6/5/8/265896/f/w/x/n/fwxn1/island.jpeg',
  plains: 'https://ist7-1.filesor.com/pimpandhost.com/2/6/5/8/265896/f/w/x/m/fwxmY/plains.jpeg',
  mountain: 'https://ist7-1.filesor.com/pimpandhost.com/2/6/5/8/265896/f/w/x/m/fwxmX/mountain.jpeg',
};
export const DeckBuilder = () => {
  const ref = useRef(null);

  const searchparms = new URLSearchParams(document.location.search);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [textAreaValue, setTextAreaValue] = useState<string>(
    (searchparms.get('list') || '').replaceAll('∆', '\n')
  );
  const [cards, setCards] = useState<HCCard.Any[]>([]);
  const [toRender, setToRender] = useState<string[] | undefined>();
  const [deckName, setNameOfDeck] = useState(searchparms.get('name') || 'your deck name goes here');
  const [renderCards, setRenderCards] = useState<HCCard.Any[]>([]);
  const [playtesting, setPlaytesthing] = useState(false);

  useEffect(() => {
    import('@hellfall/shared/data/Hellscube-Database.json').then(({ data }: any) => {
      setCards(data);
    });
  }, []);

  useEffect(() => {
    if (textAreaRef.current) {
      setToRender(textAreaRef.current.value.split('\n'));

      const searchToSet = new URLSearchParams();
      searchToSet.append('name', deckName);
      searchToSet.append('list', textAreaRef.current.value.replaceAll('\n', '∆'));

      if ((searchToSet as any).size > 0) {
        history.pushState(
          undefined,
          '',
          location.origin + location.pathname + '?' + searchToSet.toString()
        );
      }
    }
  }, [textAreaValue, deckName]);

  const toCardArr = (value: string): [number, string] => {
    const index = /^(?!0+\s)\d+\s/.test(value) ? value.indexOf(' ') : 0;
    const count = index ? parseInt(value.slice(0, index)) : 1;
    const rest = index ? value.slice(index + 1) : value;
    if (!count) {
      return [1, ''];
    }
    if (!rest) {
      return [count, ''];
    }

    if (rest[0] == '%') {
      // handle ids
      return cards.find(card => card.id == rest.slice(1)) ? [count, rest.slice(1)] : [count, ''];
    }
    if (/^\d+$/.test(rest)) {
      // handle card names that are all digits
      const id = cards.find(card => card.name == rest)?.id;
      return id ? [count, id] : [count, ''];
    }
    if (rest.toLowerCase() in basics) {
      // handle basics
      return [count, rest.toLowerCase()];
    }

    return [count, rest];
  };

  useEffect(() => {
    if (cards.length === 0) {
      return;
    }
    const images: HCCard.Any[] = (toRender || [])
      .filter(entry => entry != '' && !entry.startsWith('# '))
      .flatMap(name => {
        const [count, rest] = toCardArr(name);
        if (rest in basics) {
          const card = {
            image: [basics[rest]],
            name: rest,
          } as unknown as HCCard.Any;
          return Array(count).fill(card);
        } else {
          const id = nameToId(rest, cards);
          const card = id
            ? cards.find(card => card.id == id)
            : ({
                image: [
                  'https://ist8-2.filesor.com/pimpandhost.com/2/6/5/8/265896/i/F/z/D/iFzDJ/00_Back_l.jpg',
                ],
                name: name + ' - not found',
              } as unknown as HCCard.Any);
          return Array(count).fill(card);
        }
      });
    setRenderCards(images);
  }, [toRender, cards]);

  return (
    <div>
      <ImportInstructions />
      {renderCards.length > 0 &&
        (playtesting ? (
          <PlaytestArea cards={renderCards} />
        ) : (
          <button
            onClick={() => {
              setPlaytesthing(true);
            }}
          >
            Click here to playtest
          </button>
        ))}
      <FormField label="Deck Name">
        <TextInput
          defaultValue={deckName}
          onBlur={event => {
            setNameOfDeck(event.target.value);
          }}
        />
      </FormField>
      <StyledTextArea
        ref={textAreaRef}
        defaultValue={textAreaValue}
        placeholder="4 Strict Improvement
Swamp
Cock and Balls to Torture and Abuse"
      />
      <br />
      <button
        onClick={() => {
          if (textAreaRef.current) {
            setTextAreaValue(textAreaRef.current.value);
          }
        }}
      >
        generate deck image
      </button>
      <button
        disabled={!toRender}
        onClick={() => {
          if (ref.current) {
            downloadElementAsImage(ref.current, deckName);
          }
        }}
      >
        download deck as image sheet
      </button>{' '}
      <button
        onClick={() => {
          const val = toDeck(renderCards);
          const url =
            'data:text/plain;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(val))));
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          // the filename you want
          a.download = deckName + '.json';
          document.body.appendChild(a);
          a.click();
        }}
      >
        Download for TTS
      </button>{' '}
      <button
        onClick={() => {
          getDraftmancerForCube({
            id: 'Custom',
            name: deckName,
            allCards: cards,
            cardIds: renderCards.map(card => card.id),
          });
        }}
      >
        Download for Draftmancer
      </button>{' '}
      Cards in deck {renderCards.length}
      <br />
      <DeckContainer ref={ref}>
        {renderCards?.map((entry, i) => {
          return (
            <Card
              width="250px"
              title={entry.name}
              key={entry.name + i}
              src={entry.draft_image ? entry.draft_image : entry.image}
              crossOrigin="anonymous"
            />
          );
        })}
      </DeckContainer>
    </div>
  );
};
const DeckContainer = styled.div({});
const Card = styled.img({ width: '250px' });

//245 × 341 px

// const OtherContainer = styled.div({ display: "flex" });

const StyledTextArea = styled.textarea({ width: '50%', minHeight: '400px' });
