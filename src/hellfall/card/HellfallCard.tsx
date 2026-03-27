import { Card } from '@workday/canvas-kit-react/card';
import styled from '@emotion/styled';
import { Heading, Text } from '@workday/canvas-kit-react/text';
import { SetLegality } from './SetLegality';
import { colorsToIndicator, stringToMana } from '../stringToMana';
import { splitParens } from '../splitParens';
import { HCCard } from '../../api-types/Card/Card';
import { HellfallRelatedEntry } from '../HellfallEntry';

import { Link } from 'react-router-dom';
import { Fragment, useState } from 'react';
import { stripSemicolon } from '../inputs/stripSemicolon';
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
/**
 * This renders text that is non-italic by default but can be made italic by () or \\* and is a single line
 * @param text text to render
 * @returns JSX elements to render
 */
const renderCanBeItalicLine = (text: string) => {
  const parenText = splitParens(text)
    .map((chunk, ci) => {
      if (chunk.startsWith('(')) {
        return '\\*' + chunk + '\\*';
        // return <ItalicText key={ci}>{stringToMana(chunk)}</ItalicText>;
      }
      return chunk;
    })
    .join('');
  const parts = parenText.split('\\*');
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
/**
 * This renders text that is non-italic by default but can be made italic by () or \\*
 * @param text text to render
 * @returns JSX elements to render
 */
const renderCanBeItalicText = (text: string) => {
  const parenText = splitParens(text)
    .map((chunk, ci) => {
      if (chunk.startsWith('(')) {
        return '\\*' + chunk + '\\*';
        // return <ItalicText key={ci}>{stringToMana(chunk)}</ItalicText>;
      }
      return chunk;
    })
    .join('');
  const parts = parenText.split('\\*');
  return parts.map((part, index) => {
    if (index % 2 == 0) {
      return part.split('\\n').map((entry, i) => (
        <Fragment key={`line-${index}-${i}`}>
          <Text typeLevel="body.medium" key={`non-italic-${index}`}>
            {stringToMana(entry)}
          </Text>
          {entry && <br />}
          {/* {i == part.split('\\n').length-1 &&<br />} */}
        </Fragment>
      ));
    } else {
      return part.split('\\n').map((entry, i) => (
        <Fragment key={`line-${index}-${i}`}>
          <ItalicText typeLevel="body.medium" key={`italic-${index}`}>
            {stringToMana(entry)}
          </ItalicText>
          {entry && <br />}
          {/* {i == part.split('\\n').length-1 &&<br />} */}
        </Fragment>
      ));
      // return (
      //   <ItalicText typeLevel="body.medium" key={`italic-${index}`}>
      //     {stringToMana(part)}
      //   </ItalicText>
      // );
    }
  });
};
/**
 * This renders text that is italic by default but can be made non-italic by \\*
 * @param text text to render
 * @returns JSX elements to render
 */
const renderCanBeNonItalicText = (text: string) => {
  // const parenText = splitParens(text)
  //   .map((chunk, ci) => {
  //     if (chunk.startsWith('(')) {
  //       return '\\*' + chunk + '\\*';
  //       // return <ItalicText key={ci}>{stringToMana(chunk)}</ItalicText>;
  //     }
  //     return chunk;
  //   })
  //   .join('');
  const parts = text.split('\\*');
  return parts.map((part, index) => {
    if (index % 2 == 1) {
      return part.split('\\n').map((entry, i) => (
        <Fragment key={`line-${index}-${i}`}>
          <Text typeLevel="body.medium" key={`non-italic-${index}`}>
            {stringToMana(entry)}
          </Text>
          {entry && <br />}
          {/* {i == part.split('\\n').length-1 &&<br />} */}
        </Fragment>
      ));
    } else {
      return part.split('\\n').map((entry, i) => (
        <Fragment key={`line-${index}-${i}`}>
          <ItalicText typeLevel="body.medium" key={`italic-${index}`}>
            {stringToMana(entry)}
          </ItalicText>
          {entry && <br />}
          {/* {i == part.split('\\n').length-1 &&<br />} */}
        </Fragment>
      ));
      // return (
      //   <ItalicText typeLevel="body.medium" key={`italic-${index}`}>
      //     {stringToMana(part)}
      //   </ItalicText>
      // );
    }
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
                  <span key="name">{renderCanBeItalicLine(stripSemicolon(face.name))}</span>
                ) : (
                  <>
                    <Text typeLevel="body.medium" key="name">
                      {stringToMana(stripSemicolon(face.name))}
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
              {face.color_indicator && (
                <>
                  <Text typeLevel="body.medium" key="color-indicator">
                    {colorsToIndicator(face.color_indicator)}
                  </Text>
                  {'   '}
                </>
              )}
              {face.type_line &&
                (face.type_line.includes('\\*') || face.type_line.includes('(') ? (
                  <span key="type">{renderCanBeItalicLine(face.type_line)}</span>
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
                  <span key="rules">{renderCanBeItalicText(stripSemicolon(face.oracle_text))}</span>
                ) : (
                  <>
                    <Text typeLevel="body.medium" key="flavor">
                      {renderText(stripSemicolon(face.oracle_text).split('\\n'))}
                    </Text>
                  </>
                ))}
              {face.flavor_text &&
                face.flavor_text != ';' &&
                (face.flavor_text.includes('\\*') ? (
                  <span key="flavor">
                    {renderCanBeNonItalicText(stripSemicolon(face.flavor_text))}
                  </span>
                ) : (
                  <>
                    <ItalicText typeLevel="body.medium" key="flavor">
                      {renderText(stripSemicolon(face.flavor_text).split('\\n'))}
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
                      name={stripSemicolon(entry.name)}
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
