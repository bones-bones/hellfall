import {
  ButtonColors,
  Card,
  Heading,
  inputColors,
  PrimaryButton,
  type,
} from '@workday/canvas-kit-react';
import styled from '@emotion/styled';
import { SetLegality } from './SetLegality.tsx';
import { colorsToIndicator, stringToMana } from '../stringToMana.tsx';
import { formatParens } from '@hellfall/shared/utils';
import { HCCard } from '@hellfall/shared/types';
import { HellfallRelatedEntry } from '../HellfallEntry.tsx';

import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../auth';
import { useCardTagOverrides } from '../useCardTagOverrides.ts';
import tagsData from '@hellfall/shared/data/tags.json';
import {
  formatDiscordMarkdown,
  formatDiscordMarkdownInline,
  formatDiscordMarkdownInvertedItalics,
  formatDiscordMarkdownInvertedItalicsInline,
} from '../markdownFormatter.tsx';
const renderText = (text: string[]) => {
  return text.map(entry => {
    return (
      <>
        <MediumText>{stringToMana(entry)}</MediumText>
        {/* <br/> */}
      </>
    );
  });
};
const triggerEscapeList = ['*', '(', '_', '~'];
const getImages = (card: HCCard.Any) => {
  const imagesToShow: string[] = [];
  const imageNames: string[] = [];

  if (!('card_faces' in card) || !('image' in card.card_faces[0])) {
    imagesToShow.push(card.image!);
    imageNames.push('side 1');
  }
  if ('card_faces' in card) {
    card.card_faces
      .filter((face, i) => face.image || !i)
      .forEach((face, i) => {
        if (face.image) {
          imagesToShow.push(face.image);
          imageNames.push(`side ${i + 1}`);
        }
        if (face.still_image) {
          imagesToShow.push(face.still_image);
          imageNames.push(`side ${i + 1} still`);
        }
        if (face.rotated_image) {
          imagesToShow.push(face.rotated_image);
          imageNames.push(`side ${i + 1} rotated`);
        }
      });
    if (card.image && 'image' in card.card_faces[0]) {
      imagesToShow.push(card.image);
      imageNames.push('full');
    }
  }
  if (card.still_image) {
    imagesToShow.push(card.still_image);
    imageNames.push('still');
  }
  if (card.rotated_image) {
    imagesToShow.push(card.rotated_image);
    imageNames.push('rotated');
  }
  if (card.draft_image) {
    imagesToShow.push(card.draft_image);
    imageNames.push('draft');
  }
  if (card.still_draft_image) {
    imagesToShow.push(card.still_draft_image);
    imageNames.push('still draft');
  }
  if (card.rotated_draft_image) {
    imagesToShow.push(card.rotated_draft_image);
    imageNames.push('rotated draft');
  }
  return { images: imagesToShow, names: imageNames };
};
export const HellfallCard = ({
  data,
  onSinglePage,
}: {
  data: HCCard.Any;
  onSinglePage?: boolean;
}) => {
  const { user } = useAuth();
  const [
    displayTags,
    addTag,
    removeTag,
    tagsLoading,
    tagsError,
    tagsPersistEnabled,
    changesetSubmitted,
  ] = useCardTagOverrides(data.id, data.tags);
  const [activeImageSide, setActiveImageSide] = useState(0);
  const [newTagInput, setNewTagInput] = useState('');
  const [tagActionError, setTagActionError] = useState<string | null>(null);
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
  const { images: imagesToShow, names: imageNames } = getImages(data);

  return (
    <Container ref={windowRef} key={data.id} style={{ lineHeight: 1 }}>
      <title>{data.name} || Hellfall</title>
      {!imagesToShow.length ? (
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
                    {imageNames[i]}
                  </button>
                );
              })}
          </ButtonContainer>
        </>
      )}
      <Card style={{ width: '100%' }}>
        <Card.Body padding={'zero'} marginTop={'-20px'}>
          {/* {'card_faces' in data && <StyledHeading size="large" style={{whiteSpace: 'pre-wrap'}}>{data.name}</StyledHeading>} */}
          {('card_faces' in data ? data.card_faces : [data]).map((face, i) => (
            <span key={'face-' + (i + 1)}>
              {i > 0 && <Divider />}
              {face.name &&
                (triggerEscapeList.some(e => face.name.includes(e)) ? (
                  <MediumLine key="name" style={{ marginRight: '1em' }}>
                    {formatDiscordMarkdownInline(formatParens(face.name))}
                  </MediumLine>
                ) : (
                  <MediumLine key="name" style={{ marginRight: '1em' }}>
                    {stringToMana(face.name)}
                  </MediumLine>
                ))}
              <MediumLine key="cost"> {stringToMana(face.mana_cost)}</MediumLine>
              {face.flavor_name &&
                (triggerEscapeList.some(e => face.name.includes(e)) ? (
                  <>
                    <br />
                    <MediumLine key="flavor-name">
                      {formatDiscordMarkdownInvertedItalicsInline(formatParens(face.flavor_name))}
                    </MediumLine>
                  </>
                ) : (
                  <>
                    <br />
                    <MediumItalicLine key="flavor-name">
                      {stringToMana(face.flavor_name)}
                    </MediumItalicLine>
                  </>
                ))}
              {'   '}
              {(face.color_indicator || face.type_line) && <Separator />}
              {face.color_indicator && (
                <>
                  <MediumLine key="color-indicator">
                    {colorsToIndicator(face.color_indicator)}
                  </MediumLine>{' '}
                </>
              )}
              {face.type_line &&
                (triggerEscapeList.some(e => face.type_line.includes(e)) ? (
                  <MediumLine key="type">
                    {formatDiscordMarkdownInline(formatParens(face.type_line))}
                  </MediumLine>
                ) : (
                  <MediumLine key="type">{stringToMana(face.type_line)}</MediumLine>
                ))}
              {(face.oracle_text || face.flavor_text) && <Separator />}
              {face.oracle_text &&
                (triggerEscapeList.some(e => face.oracle_text.includes(e)) ? (
                  <MediumText key="rules">
                    {formatDiscordMarkdown(formatParens(face.oracle_text))}
                  </MediumText>
                ) : (
                  <>
                    <MediumText key="rules">{renderText(face.oracle_text.split('\\n'))}</MediumText>
                  </>
                ))}
              {face.flavor_text &&
                (['*', '_', '~'].some(e => face.flavor_text?.includes(e)) ? (
                  <MediumText key="flavor">
                    {formatDiscordMarkdownInvertedItalics(formatParens(face.flavor_text))}
                  </MediumText>
                ) : (
                  <>
                    <MediumItalics key="flavor">
                      {renderText(face.flavor_text.split('\\n'))}
                    </MediumItalics>
                  </>
                ))}
              {(face.power || face.toughness) && (
                <>
                  <Separator />
                  <MediumText key="stats">
                    {face.power}/{face.toughness}
                  </MediumText>
                </>
              )}
              {face.loyalty && (
                <>
                  <Separator />
                  <MediumText key="loyalty">Loyalty: {face.loyalty}</MediumText>
                </>
              )}
              {face.defense && (
                <>
                  <Separator />
                  <MediumText key="defense">Defense: {face.defense}</MediumText>
                </>
              )}
              {face.hand_modifier && (
                <>
                  <Separator />
                  <MediumText key="hand_modifier">Hand Size: {face.hand_modifier}</MediumText>
                </>
              )}
              {face.life_modifier && (
                <>
                  <Separator />
                  <MediumText key="life_modifier">Starting Life: {face.life_modifier}</MediumText>
                </>
              )}
            </span>
          ))}
          <Divider />
          {data.set && (
            <>
              <MediumText>
                Set:{' '}
                {(data.set == 'HCV.CDC' ? 'CDC' : data.set) +
                  (data.collector_number ? ' #' + data.collector_number : '')}
              </MediumText>
              <Separator />
            </>
          )}
          {Boolean(data.creators.length) && (
            <>
              <SmallText key="creator">
                Creator{data.creators.length == 1 ? '' : 's'}: {data.creators.join(',')}
              </SmallText>
            </>
          )}
          {data.artists?.length && (
            <>
              <SmallText key="artist">
                Artist{data.artists.length == 1 ? '' : 's'}:{' '}
                {data.artists
                  .map(
                    artist =>
                      `${artist}${
                        data.artist_notes?.[artist] ? ` (${data.artist_notes[artist]})` : ''
                      }`
                  )
                  .join(', ')}
              </SmallText>
            </>
          )}
          {data.id && (
            <>
              <SmallText key="hcid">Id: {data.id}</SmallText>
            </>
          )}
          {
            <>
              <SetLegality legality={data.legalities.standard} /> Constructed
              <br />
              <SetLegality legality={data.legalities['4cb']} /> 4CB
              <br />
              <SetLegality legality={data.legalities.commander} /> Hellsmander
              <br />
              <Separator />
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
              {tagsLoading && <SmallText>Loading tags…</SmallText>}
              {tagsError && (
                <SmallText style={{ color: '#c00' }}>Could not load tag overrides.</SmallText>
              )}
              {tagActionError && <SmallText style={{ color: '#c00' }}>{tagActionError}</SmallText>}
              <SmallText key="Tags">
                Tags:{' '}
                {displayTags.map((tagEntry, i, ar) => (
                  <span key={tagEntry}>
                    <Link
                      to={`/?${new URLSearchParams([['q', `tag:${tagEntry}`]]).toString()}`}
                      target="_blank"
                    >
                      {tagEntry}
                    </Link>
                    {data.tag_notes &&
                      tagEntry in data.tag_notes &&
                      (data.tag_notes[tagEntry].slice(0, 6) == 'https:' ? (
                        <>
                          <SmallLine> (</SmallLine>
                          <Link to={data.tag_notes[tagEntry]}>{data.tag_notes[tagEntry]}</Link>
                          <SmallLine>)</SmallLine>
                        </>
                      ) : (
                        <>
                          <SmallLine> ({data.tag_notes[tagEntry]})</SmallLine>
                        </>
                      ))}
                    {user && tagsPersistEnabled && (
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
              </SmallText>
              {user && tagsPersistEnabled && (
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
              {changesetSubmitted && (
                <SmallText style={{ color: '#28a745', marginTop: 4 }}>
                  Change submitted for review.
                </SmallText>
              )}
            </>
          ) : null}
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
                          if (
                            event.button === 1 ||
                            event.metaKey ||
                            event.ctrlKey ||
                            !onSinglePage
                          ) {
                            window.open(`/card/${encodeURIComponent(entry.id)}`, '_blank');
                          } else {
                            window.location.href = `/card/${encodeURIComponent(entry.id)}`;
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
      <ButtonGroup>
        <br />
        <Button
          colors={inputButtonColors}
          borderRadius="m"
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            if (event.button === 1 || event.metaKey || event.ctrlKey || !onSinglePage) {
              window.open(`/api/cards/${encodeURIComponent(data.id)}?format=text`, '_blank');
            } else {
              window.location.href = `/api/cards/${encodeURIComponent(data.id)}?format=text`;
            }
          }}
        >
          Copy-pasteable Text
        </Button>
        <Button
          colors={inputButtonColors}
          borderRadius="m"
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            if (event.button === 1 || event.metaKey || event.ctrlKey || !onSinglePage) {
              window.open(`/api/cards/${encodeURIComponent(data.id)}?format=json`, '_blank');
            } else {
              window.location.href = `/api/cards/${encodeURIComponent(data.id)}?format=json`;
            }
          }}
        >
          Copy-pasteable JSON
        </Button>
      </ButtonGroup>
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

const ButtonContainer = styled.div();

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

const RelatedGrid = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  gap: '0px',
  margin: '0 auto',
});

const Divider = styled('hr')({
  height: '2px',
  backgroundColor: '#ccc',
  border: 'none',
  marginLeft: '-32px',
  marginRight: '-32px',
});

const Separator = styled('hr')({
  height: '1px',
  backgroundColor: '#ccc',
  border: 'none',
  marginLeft: '-32px',
  marginRight: '-32px',
});

const Button = styled(PrimaryButton)({
  marginLeft: '30px',
  marginBottom: '15px',
  display: 'inline-block',
  flexDirection: 'row',
});
const inputButtonColors: ButtonColors = {
  default: {
    background: inputColors.background,
    border: inputColors.border,
  },
  hover: {
    background: inputColors.disabled.background,
    border: inputColors.focusBorder,
  },
  active: {
    background: inputColors.background,
    border: inputColors.border,
  },
  focus: {
    background: inputColors.disabled.background,
    border: inputColors.focusBorder,
  },
  disabled: {
    background: inputColors.disabled.background,
    border: inputColors.disabled.border,
  },
};

const MediumText = styled('div')({
  fontSize: type.levels.body.medium.fontSize,
  fontWeight: type.levels.body.medium.fontWeight,
  marginBlock: '.5rem',
  lineHeight: 1.125,
});
const MediumLine = styled('span')({
  fontSize: type.levels.body.medium.fontSize,
  fontWeight: type.levels.body.medium.fontWeight,
  marginBlock: '.5rem',
});
const MediumItalics = styled(MediumText)({ fontStyle: 'italic' });
const MediumItalicLine = styled(MediumLine)({ fontStyle: 'italic' });
const SmallText = styled('div')({
  fontSize: type.levels.body.small.fontSize,
  fontWeight: type.levels.body.small.fontWeight,
  marginBlock: '.4rem',
});
const SmallLine = styled('span')({
  fontSize: type.levels.body.small.fontSize,
  fontWeight: type.levels.body.small.fontWeight,
  marginBlock: '.4rem',
});

const ButtonGroup = styled('div')({
  display: 'inline-block',
  flexDirection: 'row', // Stack vertically
  // gap: '4px',               // Space between buttons
  marginLeft: '4px', // Optional spacing from the selectors
  verticalAlign: 'top',
});
