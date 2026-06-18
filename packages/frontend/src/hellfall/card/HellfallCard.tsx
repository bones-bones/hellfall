import {
  Box,
  ButtonColors,
  Card,
  Heading,
  inputColors,
  PrimaryButton,
  type,
  Text,
  TextProps,
} from '@workday/canvas-kit-react';
// import styled from '@emotion/styled';
import { SetLegality } from './SetLegality.tsx';
import { colorsToIndicator, stringToMana } from '../stringToMana.tsx';
import { formatParens, toPlainText } from '@hellfall/shared/utils';
import { HCCard } from '@hellfall/shared/types';

import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../auth';
import { useCardTagOverrides } from '../hooks/useCardTagOverrides.ts';
import {
  formatDiscordMarkdown,
  formatDiscordMarkdownInline,
  formatDiscordMarkdownInvertedItalics,
  formatDiscordMarkdownInvertedItalicsInline,
} from './markdownFormatter.tsx';
import { tagsData } from '@hellfall/shared/data';
import { CardEditPanel } from './CardEditPanel.tsx';
import { PendingChanges } from './PendingChanges.tsx';
import { HellfallRelatedEntry } from '../entry/HellfallRelatedEntry.tsx';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import {
  createStenciledSpan,
  createStyledButton,
  createStyledDiv,
  createStyledHeading,
  createStyledHR,
  createStyledPrimaryButtonLink,
  createStyledSpan,
} from '../../styling/StyledElements.tsx';
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
  const {
    displayCard,
    addTag,
    deleteTag,
    loading: tagsLoading,
    error: tagsError,
    persistEnabled: tagsPersistEnabled,
    changesetSubmitted,
    pendingTagStaging,
  } = useCardTagOverrides(data);
  const [activeImageSide, setActiveImageSide] = useState(0);
  const [newTagInput, setNewTagInput] = useState('');
  const [tagActionError, setTagActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const isContributor = Boolean(user?.isAdmin || user?.isContributor);
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
  const { images: imagesToShow, names: imageNames } = getImages(displayCard);

  return (
    <Box cs={containerStyles} ref={windowRef} key={displayCard.id}>
      {onSinglePage && <title>{data.name} || Hellfall</title>}
      {!imagesToShow.length ? (
        <Test>
          <ImageContainer key="image-container">
            <img
              alt={toPlainText(displayCard)}
              src={displayCard.image!}
              style={{ maxHeight: '500px', maxWidth: maxWidth + 'px' }}
              referrerPolicy="no-referrer"
            />
          </ImageContainer>
        </Test>
      ) : (
        <>
          <ImageContainer key={imagesToShow[activeImageSide] || displayCard.image}>
            <img
              alt={toPlainText(displayCard)}
              src={imagesToShow[activeImageSide] || displayCard.image!}
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
          {/* {'card_faces' in displayCard && <StyledHeading size="large" style={{whiteSpace: 'pre-wrap'}}>{displayCard.name}</StyledHeading>} */}
          {('card_faces' in displayCard ? displayCard.card_faces : [displayCard]).map((face, i) => (
            <span key={'face-' + (i + 1)}>
              {i > 0 && <Divider />}
              {face.name &&
                (displayCard.id == 'e1a6c7dc-7f25-4e02-9365-e4f79613e65d' ? (
                  <span
                    className={mediumLineMarginStyles}
                    key="name"
                    dangerouslySetInnerHTML={{ __html: face.name }}
                  />
                ) : triggerEscapeList.some(e => face.name.includes(e)) ? (
                  <MediumLineMargin key="name">
                    {formatDiscordMarkdownInline(formatParens(face.name))}
                  </MediumLineMargin>
                ) : (
                  <MediumLineMargin key="name">{stringToMana(face.name)}</MediumLineMargin>
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
                (displayCard.id == 'e1a6c7dc-7f25-4e02-9365-e4f79613e65d' ? (
                  <MediumText key="rules">
                    {formatDiscordMarkdown(
                      formatParens(face.oracle_text),
                      text =>
                        text.replaceAll(
                          'HTML Injection in the Hellfall Website Elemental',
                          face.name.replaceAll('2em', 'em')
                        ),
                      true
                    )}
                  </MediumText>
                ) : triggerEscapeList.some(e => face.oracle_text.includes(e)) ? (
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
          {displayCard.set && (
            <>
              <MediumText>
                Set:{' '}
                {(displayCard.set == 'HCV.CDC' ? 'CDC' : displayCard.set) +
                  (displayCard.collector_number ? ' #' + displayCard.collector_number : '')}
              </MediumText>
              <Separator />
            </>
          )}
          {Boolean(displayCard.creators.length) && (
            <>
              <SmallText key="creator">
                Creator{displayCard.creators.length == 1 ? '' : 's'}:{' '}
                {displayCard.creators.join(',')}
              </SmallText>
            </>
          )}
          {displayCard.artists?.length && (
            <>
              <SmallText key="artist">
                Artist{displayCard.artists.length == 1 ? '' : 's'}:{' '}
                {displayCard.artists
                  .map(
                    artist =>
                      `${artist}${
                        displayCard.artist_notes?.[artist]
                          ? ` (${displayCard.artist_notes[artist]})`
                          : ''
                      }`
                  )
                  .join(', ')}
              </SmallText>
            </>
          )}
          {displayCard.hcid && (
            <>
              <SmallText key="hcid">Id: {displayCard.hcid}</SmallText>
            </>
          )}
          {
            <>
              <SetLegality legality={displayCard.legalities.standard} /> Constructed
              <br />
              <SetLegality legality={displayCard.legalities['4cb']} /> 4CB
              <br />
              <SetLegality legality={displayCard.legalities.commander} /> Hellsmander
              <br />
              <Separator />
            </>
          }
          {displayCard.rulings && (
            <>
              <Divider />
              <div>
                <StyledHeading size="small">Rulings</StyledHeading>
                {displayCard.rulings.split('\\n').map((e, i) => {
                  return <Ruling key={i}>{e}</Ruling>;
                })}
              </div>
            </>
          )}
          {isContributor && <PendingChanges cardId={displayCard.id} />}
          {user && tagsPersistEnabled && !editing && (
            <EditCardButton type="button" onClick={() => setEditing(true)}>
              Edit Card Data
            </EditCardButton>
          )}
          {editing && (
            <CardEditPanel
              card={displayCard}
              onClose={() => setEditing(false)}
              onSubmitted={() => setEditing(false)}
            />
          )}
          {
            /* displayTags.length > 0 || pendingTagStaging || */ user ? (
              <>
                {tagsLoading && <SmallText>Loading tags…</SmallText>}
                {tagsError && <ErrorText>Could not load tag overrides.</ErrorText>}
                {tagActionError && <ErrorText>{tagActionError}</ErrorText>}
                <SmallText key="Tags">
                  Tags:{' '}
                  {displayCard.tags?.map((tagEntry, i, ar) => {
                    const pendingRemove = pendingTagStaging?.toRemove.includes(tagEntry);
                    return (
                      <span key={tagEntry}>
                        <TagLink pendingRemove={pendingRemove}>
                          <Link
                            to={`/?${new URLSearchParams([['q', `tag=${tagEntry}`]]).toString()}`}
                            target="_blank"
                          >
                            {tagEntry}
                          </Link>
                        </TagLink>
                        {displayCard.tag_notes &&
                          tagEntry in displayCard.tag_notes &&
                          (displayCard.tag_notes[tagEntry].startsWith('https:') ? (
                            <>
                              <SmallLine> (</SmallLine>
                              <Link to={displayCard.tag_notes[tagEntry]}>
                                {displayCard.tag_notes[tagEntry]}
                              </Link>
                              <SmallLine>)</SmallLine>
                            </>
                          ) : (
                            <>
                              <SmallLine> ({displayCard.tag_notes[tagEntry]})</SmallLine>
                            </>
                          ))}
                        {user && tagsPersistEnabled && (
                          <TagRemoveButton
                            type="button"
                            onClick={async () => {
                              setTagActionError(null);
                              try {
                                await deleteTag(tagEntry);
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
                    );
                  })}
                  {pendingTagStaging?.toAdd.map((tagEntry, i, ar) => (
                    <span key={`pending-${tagEntry}`}>
                      {(displayCard.tags?.length || i > 0) && ', '}
                      <TagLink pendingAdd>
                        <Link
                          to={`/?${new URLSearchParams([['q', `tag:${tagEntry}`]]).toString()}`}
                          target="_blank"
                        >
                          +{tagEntry}
                        </Link>
                      </TagLink>
                      {i < ar.length - 1 && ', '}
                    </span>
                  ))}
                </SmallText>
                {pendingTagStaging && <PendingText>Staged changes pending review.</PendingText>}
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
                {changesetSubmitted && <SubmittedText>Change submitted for review.</SubmittedText>}
              </>
            ) : (
              <>
                <SmallText key="Tags">
                  Tags:{' '}
                  {data.tags?.map((tagEntry, i, ar) => (
                    <span key={tagEntry}>
                      <TagLink>
                        <Link
                          to={`/?${new URLSearchParams([['q', `tag=${tagEntry}`]]).toString()}`}
                          target="_blank"
                        >
                          {tagEntry}
                        </Link>
                      </TagLink>
                      {data.tag_notes &&
                        tagEntry in data.tag_notes &&
                        (data.tag_notes[tagEntry].startsWith('https:') ? (
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
                      {i < ar.length - 1 && ', '}
                    </span>
                  ))}
                </SmallText>
              </>
            )
          }
          {displayCard.all_parts && (
            <>
              <Divider />
              <div>
                <StyledHeading size="small">Related Cards & Tokens</StyledHeading>
                <RelatedGrid>
                  {displayCard.all_parts
                    .filter(e => e.id != displayCard.id)
                    .map((entry, i) => (
                      <HellfallRelatedEntry
                        onClick={(event: React.MouseEvent<HTMLImageElement>) => {
                          if (
                            event.button === 1 ||
                            event.metaKey ||
                            event.ctrlKey ||
                            !onSinglePage
                          ) {
                            window.open(`/card/${encodeURIComponent(entry.hcid)}`, '_blank');
                          } else {
                            window.location.href = `/card/${encodeURIComponent(entry.hcid)}`;
                          }
                        }}
                        key={entry.id}
                        id={entry.hcid}
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
        <LinkButton
          colors={inputButtonColors}
          to={`/api/cards/${encodeURIComponent(displayCard.id)}?format=text`}
        >
          Copy-pasteable Text
        </LinkButton>
        <LinkButton
          colors={inputButtonColors}
          to={`/api/cards/${encodeURIComponent(displayCard.id)}?format=json`}
        >
          Copy-pasteable JSON
        </LinkButton>
      </ButtonGroup>
    </Box>
  );
};

const rulingStyles = createStyles({ paddingTop: '5px' });
const Ruling = createStyledDiv(rulingStyles);

const containerStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  fontSize: '16px',
  justifyContent: 'center',
  lineHeight: 1,
});
// const Container = createStyledDiv(containerStyles);

const testStyles = createStyles({
  display: 'flex',
  justifyContent: 'center',
  overflowX: 'auto',
  width: '100%',
});
const Test = createStyledDiv(testStyles);

const imageContainerStyles = createStyles({
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
const ImageContainer = createStyledDiv(imageContainerStyles);

const headingStyles = createStyles({
  marginTop: '0px',
  marginBottom: '10px',
});
const StyledHeading = createStyledHeading(headingStyles);

const ButtonContainer = Box;

const tagLinkStencil = createStencil({
  vars: {},
  base: {
    '& a': {},
  },
  modifiers: {
    pendingAdd: {
      true: {
        '& a': {
          color: '#28a745',
          fontWeight: '600',
        },
      },
    },
    pendingRemove: {
      true: {
        '& a': {
          color: '#888',
          textDecoration: 'line-through',
        },
      },
    },
  },
});
interface TagLinkProps extends TextProps {
  pendingAdd?: boolean;
  pendingRemove?: boolean;
}
const TagLink = createStenciledSpan<TagLinkProps>(tagLinkStencil);

const tagRemoveButtonStyles = createStyles({
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
const TagRemoveButton = createStyledButton(tagRemoveButtonStyles);

const tagAddRowStyles = createStyles({
  marginTop: '6px',
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  '& input': { minWidth: '120px' },
});
const TagAddRow = createStyledDiv(tagAddRowStyles);

const relatedGridStyles = createStyles({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  gap: '0px',
  margin: '0 auto',
});
const RelatedGrid = createStyledDiv(relatedGridStyles);

const dividerStyles = createStyles({
  height: '2px',
  backgroundColor: '#ccc',
  border: 'none',
  marginLeft: '-32px',
  marginRight: '-32px',
});
const Divider = createStyledHR(dividerStyles);

const separatorStyles = createStyles({
  height: '1px',
  backgroundColor: '#ccc',
  border: 'none',
  marginLeft: '-32px',
  marginRight: '-32px',
});
const Separator = createStyledHR(separatorStyles);

const linkButtonStyles = createStyles({
  marginLeft: '30px',
  marginBottom: '15px',
  borderRadius: '4px',
  textDecoration: 'none',
  '&:hover, &:focus, &:active': {
    textDecoration: 'none',
  },
});

const inputButtonColors: ButtonColors = {
  default: {
    background: inputColors.background,
    border: inputColors.border,
    label: inputColors.text,
  },
  hover: {
    background: inputColors.disabled.background,
    border: inputColors.focusBorder,
    label: inputColors.text,
  },
  active: {
    background: inputColors.background,
    border: inputColors.border,
    label: inputColors.text,
  },
  focus: {
    background: inputColors.disabled.background,
    border: inputColors.focusBorder,
    label: inputColors.text,
  },
  disabled: {
    background: inputColors.disabled.background,
    border: inputColors.disabled.border,
    label: inputColors.text,
  },
};
const LinkButton = createStyledPrimaryButtonLink(linkButtonStyles);

const mediumLineStyles = createStyles({
  fontSize: type.levels.body.medium.fontSize,
  fontWeight: type.levels.body.medium.fontWeight,
  marginBlock: '.5rem',
});
const MediumLine = createStyledSpan(mediumLineStyles);

const mediumLineMarginStyles = createStyles(mediumLineStyles, { marginRight: '1em' });
const MediumLineMargin = createStyledSpan(mediumLineMarginStyles);

const mediumTextStyles = createStyles(mediumLineStyles, { lineHeight: 1.125 });
const MediumText = createStyledDiv(mediumTextStyles);

const mediumItalicsStyles = createStyles(mediumTextStyles, { fontStyle: 'italic' });
const MediumItalics = createStyledDiv(mediumItalicsStyles);

const mediumItalicLineStyles = createStyles(mediumLineStyles, { fontStyle: 'italic' });
const MediumItalicLine = createStyledSpan(mediumItalicLineStyles);

const smallTextStyles = createStyles({
  fontSize: type.levels.body.small.fontSize,
  fontWeight: type.levels.body.small.fontWeight,
  marginBlock: '.4rem',
});
const SmallText = createStyledDiv(smallTextStyles);
const SmallLine = createStyledSpan(smallTextStyles);

const errorTextStyles = createStyles(smallTextStyles, { color: '#c00' });
const ErrorText = createStyledDiv(errorTextStyles);

const pendingTextStyles = createStyles(smallTextStyles, { color: '#856404' });
const PendingText = createStyledDiv(pendingTextStyles);

const submittedTextStyles = createStyles(smallTextStyles, { color: '#28a745', marginTop: 4 });
const SubmittedText = createStyledDiv(submittedTextStyles);

const buttonGroupStyles = createStyles({
  display: 'inline-block',
  flexDirection: 'row',
  marginLeft: '4px',
  verticalAlign: 'top',
});
const ButtonGroup = createStyledDiv(buttonGroupStyles);

const editCardButtonStyles = createStyles({
  display: 'block',
  marginTop: 6,
  marginBottom: 4,
  padding: '3px 10px',
  background: '#fff',
  border: '1px solid #ccc',
  borderRadius: 2,
  fontSize: 12,
  cursor: 'pointer',
  '&:hover': { borderColor: '#888' },
});
const EditCardButton = createStyledButton(editCardButtonStyles);
