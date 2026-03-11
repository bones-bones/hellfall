import { Card } from '@workday/canvas-kit-react/card';
import styled from '@emotion/styled';
import { Heading, Text } from '@workday/canvas-kit-react/text';
import { SetLegality } from './SetLegality';
import { stringToMana } from './stringToMana';
import { splitParens } from './splitParens';
import { HCCard } from '../api-types/Card/Card';

import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth';
import { useCardTagOverrides } from './useCardTagOverrides';
import tagsData from '../data/tags.json';

export const HellfallCard = ({ data }: { data: HCCard.Any }) => {
  const { user } = useAuth();
  const [displayTags, addTag, removeTag, tagsLoading, tagsError] = useCardTagOverrides(data.id, data.tags);
  const [activeImageSide, setActiveImageSide] = useState(0);
  const [newTagInput, setNewTagInput] = useState('');
  const [tagActionError, setTagActionError] = useState<string | null>(null);

  const imagesToShow = data
    .toFaces()
    .filter(e => e.image)
    .map(e => e.image);

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
                {face.name}
              </Text>
              {'   '}
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
          {displayTags.length > 0 || user ? (
            <>
              {tagsLoading && <Text typeLevel="body.small">Loading tags…</Text>}
              {tagsError && (
                <Text typeLevel="body.small" style={{ color: '#c00' }}>
                  Could not load tag overrides.
                </Text>
              )}
              {tagActionError && (
                <Text typeLevel="body.small" style={{ color: '#c00' }}>
                  {tagActionError}
                </Text>
              )}
              <Text key="Tags">
                Tags:{' '}
                {displayTags.map((tagEntry, i, ar) => (
                  <span key={tagEntry}>
                    <Link to={'?tags=' + tagEntry} target="_blank">
                      {tagEntry}
                    </Link>
                    {user && (
                      <TagRemoveButton
                        type="button"
                        onClick={async () => {
                          setTagActionError(null);
                          try {
                            await removeTag(tagEntry);
                          } catch {
                            setTagActionError('Failed to remove tag');
                          }
                        }}
                        title="Remove tag"
                        aria-label={`Remove tag ${tagEntry}`}
                      >
                      ×
                      </TagRemoveButton>
                    )}
                    {i < ar.length - 1 && ', '}
                  </span>
                ))}
              </Text>
              {user && (
                <TagAddRow>
                  <input
                    type="text"
                    list="hellfall-tag-list"
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    onKeyDown={async e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const v = newTagInput.trim();
                        if (v) {
                          setTagActionError(null);
                          try {
                            await addTag(v);
                            setNewTagInput('');
                          } catch {
                            setTagActionError('Failed to add tag');
                          }
                        }
                      }
                    }}
                    placeholder="Add tag..."
                    aria-label="Add tag"
                  />
                  <datalist id="hellfall-tag-list">
                    {(tagsData.data as string[]).map(t => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    onClick={async () => {
                      const v = newTagInput.trim();
                      if (v) {
                        setTagActionError(null);
                        try {
                          await addTag(v);
                          setNewTagInput('');
                        } catch {
                          setTagActionError('Failed to add tag');
                        }
                      }
                    }}
                  >
                    Add
                  </button>
                </TagAddRow>
              )}
              <br />
            </>
          ) : null}
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

const TagRemoveButton = styled.button({
  marginLeft: '2px',
  padding: '0 4px',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  fontSize: '1.1em',
  lineHeight: 1,
  verticalAlign: 'middle',
  color: '#666',
  '&:hover': { color: '#c00' },
});

const TagAddRow = styled.div({
  marginTop: '6px',
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  '& input': { minWidth: '120px' },
});

const ButtonContainer = styled.div();
