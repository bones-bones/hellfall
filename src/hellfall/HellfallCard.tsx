import { Card } from '@workday/canvas-kit-react/card';
import styled from '@emotion/styled';
import { Heading, Text } from '@workday/canvas-kit-react/text';
import { SetLegality } from './SetLegality';
import { stringToMana } from './stringToMana';
import { splitParens } from './splitParens';
import { HCCard } from '../api-types/Card/Card';

import { Link } from 'react-router-dom';
import { useState } from 'react';
export const HellfallCard = ({ data }: { data: HCCard.Any }) => {
  // const faceCount = data.
  // data['Card Type(s)']?.findLastIndex((entry: any) => entry !== null && entry != '') + 1 || 1;

  const [activeImageSide, setActiveImageSide] = useState(0);

  const imagesToShow = data
    .toFaces()
    .filter(e => e.image)
    .map(e => e.image);

  const splitParens = (text: string) => {
    const chunks: string[] = [];
    let parenLevel = 0;
    let chunkStart = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] == '(') {
        if (parenLevel == 0 && i > 0) {
          chunks.push(text.slice(chunkStart, i));
          chunkStart = i;
        }
        parenLevel++;
      } else if (text[i] == ')' && parenLevel > 0) {
        parenLevel--;
        if (parenLevel == 0) {
          chunks.push(text.slice(chunkStart, i + 1));
          chunkStart = i + 1;
        }
      }
    }
    if (chunkStart < text.length) {
      chunks.push(text.slice(chunkStart));
    }
    return chunks;
  };

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
                  >{`side ${i + 1}`}</button>
                );
              })}
          </ButtonContainer>
        </>
      )}
      <Card>
        <Card.Body padding={'zero'}>
          {/* <StyledHeading size="large" style={{whiteSpace: 'pre-wrap'}}>{data.name}</StyledHeading> */}
          {data.toFaces().map((face, i) => (
            <div key={'face-' + (i + 1)}>
              {i > 0 && <Divider />}
              <Text typeLevel="body.medium" key="name">
                {stringToMana(face.name)}
              </Text>
              {/* do I need a space here? */}
              <Text typeLevel="body.medium" key="cost">
                {stringToMana(face.mana_cost)}
              </Text>
              <br />
              <Text typeLevel="body.medium" key="type">
                {face.type_line}
              </Text>
              <br />
              <Text typeLevel="body.medium" key="rules" wordBreak="break-word">
                {face.oracle_text.split('\\n').map(entry => (
                  <>
                    {' '}
                    {}
                    {splitParens(entry).map((chunk, ci) => {
                      if (chunk.startsWith('(')) {
                        return <ItalicText key={ci}>{stringToMana(chunk)}</ItalicText>;
                      }
                      return stringToMana(chunk);
                    })}
                    <br />
                  </>
                ))}
              </Text>
              <br />

              {face.flavor_text && (
                <>
                  <ItalicText typeLevel="body.medium" key="flavor">
                    {renderText((face.flavor_text || '').split('\\n'))}
                  </ItalicText>
                  <br />
                </>
              )}
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
              Constructed <SetLegality banned={Boolean(data.legalities.standard != 'banned')} />
              <br />
              4CB <SetLegality banned={Boolean(data.legalities['4cb'] != 'banned')} />
              <br />
              Hellsmander <SetLegality banned={Boolean(data.legalities.commander != 'banned')} />
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
                <StyledHeading size="small">Related Tokens</StyledHeading>
                {data.all_parts
                  .filter(e => e.component == 'token')
                  .map((entry, i) => (
                    <img key={entry.name + i} src={entry.image} height="500px" />
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
