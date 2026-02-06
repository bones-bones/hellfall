import { Card } from '@workday/canvas-kit-react/card';
import { HCEntry } from '../types';
import styled from '@emotion/styled';
import { Heading, Text } from '@workday/canvas-kit-react/text';
import { SetLegality } from './SetLegality';
import { stringToMana } from './stringToMana';

import { Link } from 'react-router-dom';
import { useState } from 'react';
export const HellfallCard = ({ data }: { data: HCEntry }) => {
  const sideCount =
    data['Card Type(s)']?.findLastIndex((entry: any) => entry !== null && entry != '') + 1 || 1;

  const [activeImageSide, setActiveImageSide] = useState(0);

  const imagesToShow = data.Image?.filter(e => typeof e === 'string' && e !== '').slice(1);

  return (
    <Container key={data['Id']}>
      {imagesToShow.length === 0 ? (
        <Test>
          <ImageContainer key="image-container">
            <img src={data['Image'][0]!} height="500px" referrerPolicy="no-referrer" />
          </ImageContainer>
        </Test>
      ) : (
        <>
          <ImageContainer key={imagesToShow[activeImageSide] || data['Image'][0]}>
            <img
              src={imagesToShow[activeImageSide] || data['Image'][0]!}
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
          <StyledHeading size="large">{data['Name']}</StyledHeading>
          {new Array(sideCount).fill('').map((_, i) => (
            <div key={'side-' + (i + 1)}>
              {i > 0 && <Divider />}
              <Text typeLevel="body.medium" key="cost">
                {stringToMana(data.Cost?.[i] || '')}
              </Text>
              <br />
              <Text typeLevel="body.medium" key="type">
                {`${((data['Supertype(s)'] || [])[i] ?? '').replaceAll(';', ' ')} ${(
                  data['Card Type(s)']?.[i] || ''
                ).replaceAll(';', ' ')}${
                  data['Subtype(s)']?.[i] ? ' — ' + data['Subtype(s)'][i]?.replaceAll(';', ' ') : ''
                }`}
              </Text>
              <br />
              <Text typeLevel="body.medium" key="rules" wordBreak="break-word">
                {(data['Text Box']?.[i] || '').split('\\n').map(entry => (
                  <>
                    {entry
                      .split(/(?=[()]+)/)
                      .filter(chunk => chunk !== ')')
                      .map((chunk, ci) => {
                        if (chunk.startsWith('(')) {
                          return <ItalicText key={ci}>{stringToMana(chunk)})</ItalicText>;
                        }
                        return stringToMana(chunk);
                      })}
                    <br />
                  </>
                ))}
              </Text>
              <br />

              {data['Flavor Text'] &&
                data['Flavor Text'][i] !== null &&
                data['Flavor Text'][i] !== '' && (
                  <>
                    <ItalicText typeLevel="body.medium" key="flavor">
                      {renderText((data['Flavor Text']?.[i] || '').split('\\n'))}
                    </ItalicText>
                    <br />
                  </>
                )}
              {data['power']?.[i] &&
                data['power'][i]!.toString() !== '' &&
                data['power'] != null && (
                  <>
                    <Text typeLevel="body.medium" key="stats">
                      {data['power'][i]}/{data['toughness']![i]}
                    </Text>
                    <br />
                  </>
                )}
              {data['Loyalty']?.[i] &&
                data['Loyalty'][i]!.toString() !== '' &&
                data['Loyalty'][i] != null && (
                  <>
                    <Text typeLevel="body.medium" key="loyalty">
                      {data['Loyalty']?.[i]}
                    </Text>
                    <br />
                  </>
                )}
            </div>
          ))}
          <Divider />
          {data['Set'] && (
            <>
              <Text typeLevel="body.medium">Set: {data['Set']}</Text>
              <br />
            </>
          )}
          {data['Creator'] && (
            <>
              <Text key="creator">Creator: {data['Creator']}</Text>
              <br />
            </>
          )}
          {data['Id'] && (
            <>
              <Text key="id">Id: {data['Id']}</Text>
              <br />
            </>
          )}
          {
            <>
              Constructed <SetLegality banned={Boolean(data['Constructed']?.includes('Banned'))} />
              <br />
              4CB <SetLegality banned={Boolean(data['Constructed']?.includes('Banned (4CB)'))} />
              <br />
              Hellsmander{' '}
              <SetLegality banned={Boolean(data['Constructed']?.includes('Banned (Commander)'))} />
              <br />
            </>
          }
          {data['Rulings'] && data['Rulings'] != '' && (
            <>
              <Divider />
              <div>
                <StyledHeading size="small">Rulings</StyledHeading>
                {data['Rulings'].split('\\n').map((e, i) => {
                  return <Ruling key={i}>{e}</Ruling>;
                })}
              </div>
            </>
          )}
          {data.Tags && data.Tags !== '' && (
            <>
              <Text key="Tags">
                Tags:{' '}
                {data['Tags'].split(';').map((tagEntry, i, ar) => (
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
          {data['tokens'] && (
            <>
              <Divider />
              <div>
                <StyledHeading size="small">Related Tokens</StyledHeading>
                {data['tokens'].map((entry, i) => (
                  <img key={entry.Name + i} src={entry.Image} height="500px" />
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
