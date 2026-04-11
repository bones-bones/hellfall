import { Card, Heading, Text } from '@workday/canvas-kit-react';
import styled from '@emotion/styled';
import { SetLegality } from './SetLegality.tsx';
import { colorsToIndicator, stringToMana } from '../stringToMana.tsx';
import { formatParens } from '@hellfall/shared/utils/textHandling.ts';
import { HCCard } from '@hellfall/shared/types';
import { HellfallRelatedEntry } from '../HellfallEntry.tsx';

import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  formatDiscordMarkdown,
  formatDiscordMarkdownInline,
  formatDiscordMarkdownInvertedItalics,
} from '../markdownFormatter';
const renderText = (text: string[]) => {
  return text.map(entry => {
    return (
      <>
        {stringToMana(entry)}
        <br />
      </>
    );
  });
};
const getImages = (card: HCCard.Any) => {
  const imagesToShow: string[] = [];

  if (!('card_faces' in card) || !('image' in card.card_faces[0])) {
    imagesToShow.push(card.image!);
  }
  if ('card_faces' in card) {
    imagesToShow.push(...card.card_faces.filter(e => e.image).map(e => e.image!));
    if (card.image && 'image' in card.card_faces[0]) {
      imagesToShow.push(card.image);
    }
  }
  if ('draft_image' in card) {
    imagesToShow.push(card.draft_image!);
  }
  return imagesToShow;
};
export const HellfallCard = ({ data }: { data: HCCard.Any }) => {
  const [activeImageSide, setActiveImageSide] = useState(0);
  const windowRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    if (!windowRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setWindowWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(windowRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  const maxWidth = useMemo(() => {
    return Math.min(windowWidth - 10, 700);
  }, [windowWidth]);

  // TODO: add handling for flip and aftermath
  const imagesToShow = getImages(data);

  return (
    <Container ref={windowRef} key={data.id}>
      {imagesToShow.length === 0 ? (
        <Test>
          <ImageContainer key="image-container">
            <img
              src={data.image!}
              style={{ maxHeight: '500px', maxWidth: maxWidth + 'px' }}
              referrerPolicy="no-referrer"
            />
          </ImageContainer>
        </Test>
      ) : (
        <>
          <ImageContainer key={imagesToShow[activeImageSide] || data.image}>
            <img
              src={imagesToShow[activeImageSide] || data.image!}
              style={{ maxHeight: '500px', maxWidth: maxWidth + 'px' }}
              referrerPolicy="no-referrer"
            />
          </ImageContainer>
          <ButtonContainer>
            {imagesToShow.length > 1 &&
              imagesToShow.map((_e, i) => {
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveImageSide(i);
                    }}
                    disabled={i === activeImageSide}
                  >
                    {i == imagesToShow.length - 1 && data.draft_image
                      ? 'draft'
                      : !data.draft_image &&
                        i == imagesToShow.length - 1 &&
                        'card_faces' in data &&
                        !('image' in data.card_faces[0])
                      ? 'full'
                      : `side ${i + 1}`}
                  </button>
                );
              })}
          </ButtonContainer>
        </>
      )}
      <Card style={{ width: '100%' }}>
        <Card.Body padding={'zero'}>
          {/* {'card_faces' in data && <StyledHeading size="large" style={{whiteSpace: 'pre-wrap'}}>{data.name}</StyledHeading>} */}
          {data.toFaces().map((face, i) => (
            <div key={'face-' + (i + 1)}>
              {i > 0 && <Divider />}
              {face.name &&
                (['*', '(', '_', '~'].some(char => face.name.includes(char)) ? (
                  <Text typeLevel="body.medium" key="name">
                    {formatDiscordMarkdownInline(formatParens(face.name))}
                  </Text>
                ) : (
                  <>
                    <Text typeLevel="body.medium" key="name">
                      {stringToMana(face.name)}
                    </Text>
                    {/* <br /> */}
                  </>
                ))}
              {'   '}
              <Text typeLevel="body.medium" key="cost">
                {stringToMana(face.mana_cost)}
              </Text>
              <br />
              {face.color_indicator && (
                <>
                  <Text typeLevel="body.medium" key="color-indicator">
                    {colorsToIndicator(face.color_indicator)}
                  </Text>
                  {'   '}
                </>
              )}
              {face.type_line &&
                (['*', '(', '_', '~'].some(char => face.type_line.includes(char)) ? (
                  <Text typeLevel="body.medium" key="type">
                    {formatDiscordMarkdownInline(formatParens(face.type_line))}
                  </Text>
                ) : (
                  <>
                    <Text typeLevel="body.medium" key="type">
                      {stringToMana(face.type_line)}
                    </Text>
                    {/* <br /> */}
                  </>
                ))}
              <br />
              {face.oracle_text &&
                (['*', '(', '_', '~'].some(char => face.oracle_text.includes(char)) ? (
                  <Text typeLevel="body.medium" key="rules">
                    {formatDiscordMarkdown(formatParens(face.oracle_text))}
                    <br />
                  </Text>
                ) : (
                  <>
                    <Text typeLevel="body.medium" key="rules">
                      {renderText(face.oracle_text.split('\\n'))}
                    </Text>
                  </>
                ))}
              {face.flavor_text &&
                (['*', '_', '~'].some(char => face.flavor_text?.includes(char)) ? (
                  <Text typeLevel="body.medium" key="flavor">
                    {formatDiscordMarkdownInvertedItalics(formatParens(face.flavor_text))}
                    <br />
                  </Text>
                ) : (
                  <>
                    <ItalicText typeLevel="body.medium" key="flavor">
                      {renderText(face.flavor_text.split('\\n'))}
                    </ItalicText>
                  </>
                ))}
              {face.power && (
                <>
                  <Text typeLevel="body.medium" key="stats">
                    {face.power}/{face.toughness}
                  </Text>
                  <br />
                </>
              )}
              {face.loyalty && (
                <>
                  <Text typeLevel="body.medium" key="loyalty">
                    Loyalty: {face.loyalty}
                  </Text>
                  <br />
                </>
              )}
              {face.defense && (
                <>
                  <Text typeLevel="body.medium" key="defense">
                    Defense: {face.defense}
                  </Text>
                  <br />
                </>
              )}
              {face.hand_modifier && (
                <>
                  <Text typeLevel="body.medium" key="hand_modifier">
                    Hand Size: {face.hand_modifier}
                  </Text>
                  <br />
                </>
              )}
              {face.life_modifier && (
                <>
                  <Text typeLevel="body.medium" key="life_modifier">
                    Starting Life: {face.life_modifier}
                  </Text>
                  <br />
                </>
              )}
            </div>
          ))}
          <Divider />
          {data.set && (
            <>
              <Text typeLevel="body.medium">Set: {data.set}</Text>
              <br />
            </>
          )}
          {data.creators.length && data.creators.length == 1 ? (
            <>
              <Text key="creator">Creator: {data.creators[0]}</Text>
              <br />
            </>
          ) : (
            <>
              <Text key="creator">Creators: {data.creators.join(', ')}</Text>
              <br />
            </>
          )}
          {data.id && (
            <>
              <Text key="id">Id: {data.id}</Text>
              <br />
            </>
          )}
          {
            <>
              Constructed <SetLegality banned={Boolean(data.legalities.standard != 'legal')} />
              <br />
              4CB <SetLegality banned={Boolean(data.legalities['4cb'] != 'legal')} />
              <br />
              Hellsmander <SetLegality banned={Boolean(data.legalities.commander != 'legal')} />
              <br />
            </>
          }
          {data.rulings && (
            <>
              <Divider />
              <div>
                <StyledHeading size="small">Rulings</StyledHeading>
                {data.rulings.split('\\n').map((e, i) => {
                  return <Ruling key={i}>{e}</Ruling>;
                })}
              </div>
            </>
          )}
          {data.tags && (
            <>
              <Text key="Tags">
                Tags:{' '}
                {data.tags.map((tagEntry, i, ar) => (
                  <>
                    <Link key={tagEntry} to={'/?tags=' + tagEntry} target="_blank">
                      {tagEntry}
                    </Link>
                    {data.tag_notes &&
                      tagEntry in data.tag_notes &&
                      (data.tag_notes[tagEntry].slice(0, 6) == 'https:' ? (
                        <>
                          <Text> (</Text>
                          <Link to={data.tag_notes[tagEntry]}>{data.tag_notes[tagEntry]}</Link>
                          <Text>)</Text>
                        </>
                      ) : (
                        <>
                          <Text> ({data.tag_notes[tagEntry]})</Text>
                        </>
                      ))}
                    {i < ar.length - 1 && ', '}
                  </>
                ))}
              </Text>
              <br />
            </>
          )}
          {data.all_parts && (
            <>
              <Divider />
              <div>
                <StyledHeading size="small">Related Cards & Tokens</StyledHeading>
                <RelatedGrid>
                  {data.all_parts
                    .filter(e => e.id != data.id)
                    .map((entry, i) => (
                      <HellfallRelatedEntry
                        onClick={(event: React.MouseEvent<HTMLImageElement>) => {
                          if (event.button === 1 || event.metaKey || event.ctrlKey) {
                            window.open('/hellfall/card/' + encodeURIComponent(entry.id), '_blank');
                          } else {
                            window.location.href = '/hellfall/card/' + encodeURIComponent(entry.id);
                          }
                        }}
                        key={entry.id}
                        id={entry.id}
                        name={entry.name}
                        url={entry.image!}
                      />
                    ))}
                </RelatedGrid>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

const Ruling = styled.div({ paddingTop: '5px' });

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  fontSize: '16px',
  justifyContent: 'center',
});

const ItalicText = styled(Text)({ fontStyle: 'italic' });

const Test = styled.div({
  display: 'flex',
  justifyContent: 'center',
  overflowX: 'auto',
  width: '100%',
});
const ImageContainer = styled.div({
  display: 'flex',
  overflow: 'auto',
  height: '500px',
  alignItems: 'center',
  justifyContent: 'center',
  maxWidth: '700px',
  '& img': {
    maxHeight: '100%',
    maxWidth: '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
  },
});
const StyledHeading = styled(Heading)({
  marginTop: '0px',
  marginBottom: '10px',
});
const Divider = styled.div({
  height: '1px',
  backgroundColor: 'grey',
  marginTop: '10px',
  marginBottom: '10px',
});

const ButtonContainer = styled.div();

const RelatedGrid = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  gap: '0px',
  margin: '0 auto',
});
