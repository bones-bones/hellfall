import { useEffect, useMemo, useRef, useState } from 'react';
import { downloadElementAsImage } from './download-image';
import { HCCard, SetCode } from '@hellfall/shared/types';
// import { toDeck } from './toDeck.ts';
import { TextInput, Box, FormField } from '@workday/canvas-kit-react';
import { ImportInstructions } from './ImportInstructions.tsx';
import { PlaytestArea } from './playtest/PlaytestArea.tsx';
import { downloadDraftmancer } from '../cube-resources/downloadDraftmancer.ts';
import { useLocation, useNavigate } from 'react-router-dom';
import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledImg, createStyledTextArea } from '../styling';
import { CardMap, HCToTTSDeck, unescapeBase64 } from '@hellfall/shared/utils';
import { loadCardsData } from '@hellfall/shared/data';

// const blankCard = {
//               image:
//                 ,
//               name: 'card not found',
//             } as unknown as HCCard.Any

const blankImage =
  'https://ist8-2.filesor.com/pimpandhost.com/2/6/5/8/265896/i/F/z/D/iFzDJ/00_Back_l.jpg';

export const DeckBuilder = () => {
  const ref = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const searchparms = new URLSearchParams(location.search);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [textAreaValue, setTextAreaValue] = useState<string>(
    (searchparms.get('list') || '').replaceAll('∆', '\n')
  );
  const [cardMap, setCardMap] = useState<CardMap>(() => new CardMap());
  useEffect(() => {
    loadCardsData().then(data => setCardMap(new CardMap(data.data)));
  }, []);
  // const [cards, setCards] = useState<HCCard.Any[]>([]);
  const [toRender, setToRender] = useState<string[] | undefined>();
  const [deckName, setNameOfDeck] = useState(searchparms.get('name') ?? '');
  const [idList, setIdList] = useState<string[]>([]);
  const [playtesting, setPlaytesthing] = useState(false);
  const [showImage, setShowImage] = useState(true);

  // useEffect(() => {
  //   import('@hellfall/shared/data/Hellscube-Database.json').then(({ data }: any) => {
  //     setCards(data);
  //   });
  // }, []);

  useEffect(() => {
    if (textAreaRef.current) {
      const names = textAreaRef.current.value.split('\n') ?? [];
      updateCards(names);

      const searchToSet = new URLSearchParams();
      searchToSet.append('name', deckName);
      searchToSet.append('list', textAreaRef.current.value.replaceAll('\n', '∆'));

      if (searchToSet.size) {
        const newUrl = `${searchToSet.size ? `?${searchToSet.toString()}` : ''}`;
        const currentUrl = location.search;
        if (newUrl != currentUrl) navigate(newUrl);
        // history.pushState(
        //   undefined,
        //   '',
        //   document.location.origin + location.pathname + '?' + searchToSet.toString()
        // );
      }
    }
  }, [textAreaValue, deckName, cardMap]);

  const updateCards = (names: string[]) => {
    const newIdList: string[] = [];
    for (const name of names) {
      const { card, count } = cardMap.getForDeck(name);
      const id = card?.id ?? '';
      if (count) {
        newIdList.push(...Array(count).fill(id));
      } else {
        newIdList.push(id);
      }
    }
    const images = cardMap.getImages(newIdList, blankImage);
    setIdList(newIdList.filter(Boolean));
    setToRender(images);
  };
  // TODO: make this push to history less often? also add url syncing
  return (
    <div style={{ marginLeft: '32px' }}>
      <title>Deck/Cube Builder</title>
      <ImportInstructions />
      {Boolean(idList.length) &&
        (playtesting ? (
          <PlaytestArea cards={cardMap.getMultiple(idList)} />
        ) : (
          <button
            onClick={() => {
              setPlaytesthing(true);
            }}
          >
            Click here to playtest
          </button>
        ))}
      <FormField>
        <FormField.Label>Deck Name</FormField.Label>
        <TextInput
          defaultValue={deckName}
          placeholder="your deck name goes here"
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
Cock and Balls to Torture and Abuse
2 Island L18
%1984"
      />
      <br />
      <button
        onClick={() => {
          if (!showImage) {
            setShowImage(true);
          }
          if (textAreaRef.current) {
            setTextAreaValue(textAreaRef.current.value);
          }
        }}
      >
        generate deck image
      </button>
      <button
        onClick={() => {
          if (showImage) {
            setShowImage(false);
          }
          if (textAreaRef.current) {
            setTextAreaValue(textAreaRef.current.value);
          }
        }}
      >
        set deck (no image)
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
          const val = HCToTTSDeck(deckName, idList, cardMap);
          const url =
            'data:text/plain;base64,' +
            btoa(unescapeBase64(encodeURIComponent(JSON.stringify(val, null, 2))));
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
          downloadDraftmancer({
            name: deckName,
            set: 'Custom' as SetCode,
            idList,
            cardMap,
          });
        }}
      >
        Download for Draftmancer
      </button>{' '}
      Cards in deck: {toRender?.length ?? 0}
      <br />
      {showImage && (
        <DeckContainer ref={ref}>
          {toRender?.map((image, i) => {
            return (
              <Card
                width="250px"
                title={`image-${i}`}
                key={`image-${i}`}
                src={image}
                crossOrigin="anonymous"
              />
            );
          })}
        </DeckContainer>
      )}
    </div>
  );
};
const DeckContainer = Box;
const cardStyles = createStyles({ width: '250px' });
const Card = createStyledImg(cardStyles, 'Card');

//245 × 341 px

// const OtherContainer = styled.div({ display: "flex" });

const textAreaStyles = createStyles({ width: '50%', minHeight: '400px' });
const StyledTextArea = createStyledTextArea(textAreaStyles, 'StyledTextArea');
