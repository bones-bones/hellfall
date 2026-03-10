import { Card } from '@workday/canvas-kit-react/card';
import styled from '@emotion/styled';
import { Heading, Text } from '@workday/canvas-kit-react/text';
import { SetLegality } from './SetLegality';
import { stringToMana } from './stringToMana';
import { splitParens } from './splitParens';
import { HCCard } from '../api-types/Card/Card';
import { HellfallRelatedEntry } from './HellfallEntry';

import { Link } from 'react-router-dom';
import { useState } from 'react';
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
const renderName = (text: string) => {
  const parenLine = splitParens(text)
    .map((chunk, ci) => {
      if (chunk.startsWith('(')) {
        return '\\*' + chunk + '\\*';
        // return <ItalicText key={ci}>{stringToMana(chunk)}</ItalicText>;
      }
      return chunk;
    })
    .join('');
  const parts = parenLine.split('\\*');
  return parts.map((part, index) => {
    if (index % 2 == 0) {
      return (
        <Text typeLevel="body.medium" key={`non-italic-${index}`}>
          {stringToMana(part)}
        </Text>
      );
    } else {
      return (
        <ItalicText typeLevel="body.medium" key={`italic-${index}`}>
          {stringToMana(part)}
        </ItalicText>
      );
    }
  });
};
const renderOracleLine = (text: string) => {
  const parts = text.split('\\*');
  return parts.map((part, index) => {
    if (index % 2 == 0) {
      return (
        <Text typeLevel="body.medium" key={`non-italic-${index}`}>
          {stringToMana(part)}
        </Text>
      );
    } else {
      return (
        <ItalicText typeLevel="body.medium" key={`italic-${index}`}>
          {stringToMana(part)}
        </ItalicText>
      );
    }
  });
};
const renderOracleText = (text: string[]) => {
  return text.map(entry => {
    return (
      <>
        {renderOracleLine(
          splitParens(entry)
            .map((chunk, ci) => {
              if (chunk.startsWith('(')) {
                return '\\*' + chunk + '\\*';
                // return <ItalicText key={ci}>{stringToMana(chunk)}</ItalicText>;
              }
              return chunk;
            })
            .join('')
        )}
        <br />
      </>
    );
  });
};
const renderFlavorLine = (text: string) => {
  const parts = text.split('\\*');
  return parts.map((part, index) => {
    if (index % 2 == 1) {
      return (
        <Text typeLevel="body.medium" key={`non-italic-${index}`}>
          {stringToMana(part)}
        </Text>
      );
    } else {
      return (
        <ItalicText typeLevel="body.medium" key={`italic-${index}`}>
          {stringToMana(part)}
        </ItalicText>
      );
    }
  });
};
const renderFlavorText = (text: string[]) => {
  return text.map(entry => {
    return (
      <>
        {renderFlavorLine(entry)}
        <br />
      </>
    );
  });
};
const getImages = (card: HCCard.Any) => {
  const imagesToShow: string[] = [];

  if (!('card_faces' in card) || (card.card_faces.length > 1 && !('image' in card.card_faces[0]))) {
    imagesToShow.push(card.image!);
  }
  if ('card_faces' in card) {
    imagesToShow.push(...card.card_faces.filter(e => e.image).map(e => e.image!));
  }
  if ('draft_image' in card) {
    imagesToShow.push(card.draft_image!);
  }
  return imagesToShow;
};
export const HellfallCard = ({ data }: { data: HCCard.Any }) => {
  // const faceCount = data.
  // data['Card Type(s)']?.findLastIndex((entry: any) => entry !== null && entry != '') + 1 || 1;

  const [activeImageSide, setActiveImageSide] = useState(0);

  // TODO: add handling for flip and aftermath
  // TODO: add color indicator symbols
  const imagesToShow = getImages(data);
  //   'card_faces' in data
  //     ? [
  //         data.image,
  //         ...data
  //           .toFaces()
  //           .filter(e => e.image)
  //           .map(e => e.image),
  //       ]
  //     : [data.image];
  // const draftImage = data.draft_image;
  // if (draftImage) {
  //   imagesToShow.push(draftImage);
  // }

  return (
    <Container key={data.id}>
      {imagesToShow.length === 0 ? (
        <Test>
          <ImageContainer key="image-container">
            <img src={data.image!} height="500px" referrerPolicy="no-referrer" />
          </ImageContainer>
        </Test>
      ) : (
        <>
          <ImageContainer key={imagesToShow[activeImageSide] || data.image}>
            <img
              src={imagesToShow[activeImageSide] || data.image!}
              height="500px"
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
                    {i == imagesToShow.length - 1 && data.draft_image ? 'draft' : `side ${i + 1}`}
                  </button>
                );
              })}
          </ButtonContainer>
        </>
      )}
      <Card>
        <Card.Body padding={'zero'}>
          {/* {'card_faces' in data && <StyledHeading size="large" style={{whiteSpace: 'pre-wrap'}}>{data.name}</StyledHeading>} */}
          {data.toFaces().map((face, i) => (
            <div key={'face-' + (i + 1)}>
              {i > 0 && <Divider />}
              {face.name &&
                face.name != ';' &&
                (face.name.includes('\\*') || face.name.includes('(') ? (
                  <div key="name">
                    {renderName(face.name.startsWith(';') ? face.name.slice(1) : face.name)}
                  </div>
                ) : (
                  <>
                    <Text typeLevel="body.medium" key="name">
                      {stringToMana(face.name.startsWith(';') ? face.name.slice(1) : face.name)}
                    </Text>
                    {/* <br /> */}
                  </>
                ))}
              {/* <Text typeLevel="body.medium" key="name">
                {face.name[0] == ';' ? face.name.slice(1) : face.name}
              </Text> */}
              {'   '}
              <Text typeLevel="body.medium" key="cost">
                {stringToMana(face.mana_cost)}
              </Text>
              <br />
              {face.type_line &&
                (face.type_line.includes('\\*') || face.type_line.includes('(') ? (
                  <div key="type">
                    {renderName(face.type_line)}
                  </div>
                ) : (
                  <>
                    <Text typeLevel="body.medium" key="type">
                      {stringToMana(face.type_line)}
                    </Text>
                    {/* <br /> */}
                  </>
                ))}
              {/* <Text typeLevel="body.medium" key="type">
                {face.type_line}
              </Text> */}
              <br />
              {face.oracle_text &&
                face.oracle_text != ';' &&
                (face.oracle_text.includes('\\*') || face.oracle_text.includes('(') ? (
                  <div key="rules">
                    {renderOracleText(
                      (face.oracle_text.startsWith(';')
                        ? face.oracle_text.slice(1)
                        : face.oracle_text
                      ).split('\\n')
                    )}
                  </div>
                ) : (
                  <>
                    <Text typeLevel="body.medium" key="flavor">
                      {renderText(
                        (face.oracle_text.startsWith(';')
                          ? face.oracle_text.slice(1)
                          : face.oracle_text
                        ).split('\\n')
                      )}
                    </Text>
                    <br />
                  </>
                ))}
              {face.flavor_text &&
                face.flavor_text != ';' &&
                (face.flavor_text.includes('\\*') ? (
                  <div key="flavor">
                    {renderFlavorText(
                      (face.flavor_text.startsWith(';')
                        ? face.flavor_text.slice(1)
                        : face.flavor_text
                      ).split('\\n')
                    )}
                  </div>
                ) : (
                  <>
                    <ItalicText typeLevel="body.medium" key="flavor">
                      {renderText(
                        (face.flavor_text.startsWith(';')
                          ? face.flavor_text.slice(1)
                          : face.flavor_text
                        ).split('\\n')
                      )}
                    </ItalicText>
                    <br />
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
          {data.creator && (
            <>
              <Text key="creator">Creator: {data.creator}</Text>
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
                    <Link key={tagEntry} to={'?tags=' + tagEntry} target="_blank">
                      {tagEntry}
                    </Link>
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
                {data.all_parts
                  .filter(e => e.id != data.id)
                  .map((entry, i) => (
                    <HellfallRelatedEntry
                      onClick={(event: React.MouseEvent<HTMLImageElement>) => {
                        if (event.button === 1 || event.metaKey || event.ctrlKey) {
                          window.open('/hellfall/card/' + encodeURIComponent(entry.id), '_blank');
                        } else {
                          (window.location.href = '/hellfall/card/' + encodeURIComponent(entry.id)),
                            '_blank';
                        }
                      }}
                      onClickTitle={(event: React.MouseEvent<HTMLImageElement>) => {
                        if (event.button === 1 || event.metaKey || event.ctrlKey) {
                          window.open('/hellfall/card/' + encodeURIComponent(entry.id), '_blank');
                        } else {
                          (window.location.href = '/hellfall/card/' + encodeURIComponent(entry.id)),
                            '_blank';
                        }
                      }}
                      key={entry.id}
                      id={entry.id}
                      name={entry.name}
                      url={entry.image!}
                    />

                    // <img key={entry.name + i} src={entry.image} height="500px" />
                  ))}
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
