import {
  Box,
  ButtonColors,
  Card,
  Heading,
  inputColors,
  PrimaryButton,
  type,
  Text
} from '@workday/canvas-kit-react';
// import styled from '@emotion/styled';
import { SetLegality } from './SetLegality.tsx';
import { colorsToIndicator, stringToMana } from '../stringToMana.tsx';
import { formatParens, toPlainText } from '@hellfall/shared/utils';
import { HCCard } from '@hellfall/shared/types';

import { Link } from 'react-router-dom';
import {
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
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
const renderText = (text: string[]) => {
  return text.map(entry => {
    return (
      <>
        <Box cs={mediumText}>{stringToMana(entry)}</Box>
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
    <Box cs={container} ref={windowRef} key={displayCard.id}>
      {onSinglePage && <title>{data.name} || Hellfall</title>}
      {!imagesToShow.length ? (
        <Box cs={test}>
          <Box cs={imageContainer} key="image-container">
            <img
              alt={toPlainText(displayCard)}
              src={displayCard.image!}
              style={{ maxHeight: '500px', maxWidth: maxWidth + 'px' }}
              referrerPolicy="no-referrer"
            />
          </Box>
        </Box>
      ) : (
        <>
          <Box cs={imageContainer} key={imagesToShow[activeImageSide] || displayCard.image}>
            <img
              alt={toPlainText(displayCard)}
              src={imagesToShow[activeImageSide] || displayCard.image!}
              style={{ maxHeight: '500px', maxWidth: maxWidth + 'px' }}
              referrerPolicy="no-referrer"
            />
          </Box>
          <Box>
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
          </Box>
        </>
      )}
      <Card cs={{ width: '100%' }}>
        <Card.Body padding={'zero'} marginTop={'-20px'}>
          {/* {'card_faces' in displayCard && <StyledHeading size="large" style={{whiteSpace: 'pre-wrap'}}>{displayCard.name}</StyledHeading>} */}
          {('card_faces' in displayCard ? displayCard.card_faces : [displayCard]).map((face, i) => (
            <span key={'face-' + (i + 1)}>
              {i > 0 && <hr className={divider} />}
              {face.name &&
                (displayCard.id == 'e1a6c7dc-7f25-4e02-9365-e4f79613e65d' ? (
                  <Text cs={mediumLineMargin}
                    key="name"
                    dangerouslySetInnerHTML={{ __html: face.name }}
                  />
                ) : triggerEscapeList.some(e => face.name.includes(e)) ? (
                  <Text cs={mediumLineMargin} key="name">
                    {formatDiscordMarkdownInline(formatParens(face.name))}
                  </Text>
                ) : (
                  <Text cs={mediumLineMargin} key="name">
                    {stringToMana(face.name)}
                  </Text>
                ))}
              <Text cs={mediumLine} key="cost"> {stringToMana(face.mana_cost)}</Text>
              {face.flavor_name &&
                (triggerEscapeList.some(e => face.name.includes(e)) ? (
                  <>
                    <br />
                    <Text cs={mediumLine} key="flavor-name">
                      {formatDiscordMarkdownInvertedItalicsInline(formatParens(face.flavor_name))}
                    </Text>
                  </>
                ) : (
                  <>
                    <br />
                    <Text cs={mediumItalicLine} key="flavor-name">
                      {stringToMana(face.flavor_name)}
                    </Text>
                  </>
                ))}
              {'   '}
              {(face.color_indicator || face.type_line) && <hr className={separator} />}
              {face.color_indicator && (
                <>
                  <Text cs={mediumLine} key="color-indicator">
                    {colorsToIndicator(face.color_indicator)}
                  </Text>{' '}
                </>
              )}
              {face.type_line &&
                (triggerEscapeList.some(e => face.type_line.includes(e)) ? (
                  <Text cs={mediumLine} key="type">
                    {formatDiscordMarkdownInline(formatParens(face.type_line))}
                  </Text>
                ) : (
                  <Text cs={mediumLine} key="type">{stringToMana(face.type_line)}</Text>
                ))}
              {(face.oracle_text || face.flavor_text) && <hr className={separator} />}
              {face.oracle_text &&
                (displayCard.id == 'e1a6c7dc-7f25-4e02-9365-e4f79613e65d' ? (
                  <Box cs={mediumText} key="rules">
                    {formatDiscordMarkdown(
                      formatParens(face.oracle_text),
                      text =>
                        text.replaceAll(
                          'HTML Injection in the Hellfall Website Elemental',
                          face.name.replaceAll('2em', 'em')
                        ),
                      true
                    )}
                  </Box>
                ) : triggerEscapeList.some(e => face.oracle_text.includes(e)) ? (
                  <Box cs={mediumText} key="rules">
                    {formatDiscordMarkdown(formatParens(face.oracle_text))}
                  </Box>
                ) : (
                  <>
                    <Box cs={mediumText} key="rules">{renderText(face.oracle_text.split('\\n'))}</Box>
                  </>
                ))}
              {face.flavor_text &&
                (['*', '_', '~'].some(e => face.flavor_text?.includes(e)) ? (
                  <Box cs={mediumText} key="flavor">
                    {formatDiscordMarkdownInvertedItalics(formatParens(face.flavor_text))}
                  </Box>
                ) : (
                  <>
                    <Box cs={mediumItalics} key="flavor">
                      {renderText(face.flavor_text.split('\\n'))}
                    </Box>
                  </>
                ))}
              {(face.power || face.toughness) && (
                <>
                  <hr className={separator} />
                  <Box cs={mediumText} key="stats">
                    {face.power}/{face.toughness}
                  </Box>
                </>
              )}
              {face.loyalty && (
                <>
                  <hr className={separator} />
                  <Box cs={mediumText} key="loyalty">Loyalty: {face.loyalty}</Box>
                </>
              )}
              {face.defense && (
                <>
                  <hr className={separator} />
                  <Box cs={mediumText} key="defense">Defense: {face.defense}</Box>
                </>
              )}
              {face.hand_modifier && (
                <>
                  <hr className={separator} />
                  <Box cs={mediumText} key="hand_modifier">Hand Size: {face.hand_modifier}</Box>
                </>
              )}
              {face.life_modifier && (
                <>
                  <hr className={separator} />
                  <Box cs={mediumText} key="life_modifier">Starting Life: {face.life_modifier}</Box>
                </>
              )}
            </span>
          ))}
          <hr className={divider} />
          {displayCard.set && (
            <>
              <Box cs={mediumText}>
                Set:{' '}
                {(displayCard.set == 'HCV.CDC' ? 'CDC' : displayCard.set) +
                  (displayCard.collector_number ? ' #' + displayCard.collector_number : '')}
              </Box>
              <hr className={separator} />
            </>
          )}
          {Boolean(displayCard.creators.length) && (
            <>
              <Box cs={smallText} key="creator">
                Creator{displayCard.creators.length == 1 ? '' : 's'}:{' '}
                {displayCard.creators.join(',')}
              </Box>
            </>
          )}
          {displayCard.artists?.length && (
            <>
              <Box cs={smallText} key="artist">
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
              </Box>
            </>
          )}
          {displayCard.hcid && (
            <>
              <Box cs={smallText} key="hcid">Id: {displayCard.hcid}</Box>
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
              <hr className={separator} />
            </>
          }
          {displayCard.rulings && (
            <>
              <hr className={divider} />
              <div>
                <Heading cs={headingStyles} size="small">Rulings</Heading>
                {displayCard.rulings.split('\\n').map((e, i) => {
                  return <Box cs={ruling} key={i}>{e}</Box>;
                })}
              </div>
            </>
          )}
          {isContributor && <PendingChanges cardId={displayCard.id} />}
          {user && tagsPersistEnabled && !editing && (
            <button className={editCardButton} type="button" onClick={() => setEditing(true)}>
              Edit Card Data
            </button>
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
                {tagsLoading && <Box cs={smallText}>Loading tags…</Box>}
                {tagsError && (
                  <Box cs={smallText} style={{ color: '#c00' }}>Could not load tag overrides.</Box>
                )}
                {tagActionError && (
                  <Box cs={smallText} style={{ color: '#c00' }}>{tagActionError}</Box>
                )}
                <Box cs={smallText} key="Tags">
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
                              <Text cs={smallText}> (</Text>
                              <Link to={displayCard.tag_notes[tagEntry]}>
                                {displayCard.tag_notes[tagEntry]}
                              </Link>
                              <Text cs={smallText}>)</Text>
                            </>
                          ) : (
                            <>
                              <Text cs={smallText}> ({displayCard.tag_notes[tagEntry]})</Text>
                            </>
                          ))}
                        {user && tagsPersistEnabled && (
                          <button
                            className={tagRemoveButton}
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
                          </button>
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
                </Box>
                {pendingTagStaging && (
                  <Box cs={smallText} style={{ color: '#856404' }}>Staged changes pending review.</Box>
                )}
                {user && tagsPersistEnabled && (
                  <Box cs={tagAddRow}>
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
                  </Box>
                )}
                {changesetSubmitted && (
                  <Box cs={smallText} style={{ color: '#28a745', marginTop: 4 }}>
                    Change submitted for review.
                  </Box>
                )}
              </>
            ) : (
              <>
                <Box cs={smallText} key="Tags">
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
                            <Text cs={smallText}> (</Text>
                            <Link to={data.tag_notes[tagEntry]}>{data.tag_notes[tagEntry]}</Link>
                            <Text cs={smallText}>)</Text>
                          </>
                        ) : (
                          <>
                            <Text cs={smallText}> ({data.tag_notes[tagEntry]})</Text>
                          </>
                        ))}
                      {i < ar.length - 1 && ', '}
                    </span>
                  ))}
                </Box>
              </>
            )
          }
          {displayCard.all_parts && (
            <>
              <hr className={divider} />
              <div>
                <Heading cs={headingStyles} size="small">Related Cards & Tokens</Heading>
                <Box cs={relatedGrid}>
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
                </Box>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
      <Box cs={buttonGroup}>
        <br />
        <PrimaryButton
          colors={inputButtonColors}
          cs={buttonStyles}
          as={Link}
          to={`/api/cards/${encodeURIComponent(displayCard.id)}?format=text`}
          // ref={linkRef}
        >
          Copy-pasteable Text
        </PrimaryButton>
        <PrimaryButton
          colors={inputButtonColors}
          cs={buttonStyles}
          as={Link}
          to={`/api/cards/${encodeURIComponent(displayCard.id)}?format=json`}
          // ref={linkRef}
        >
          Copy-pasteable JSON
        </PrimaryButton>
      </Box>
    </Box>
  );
};

const ruling = createStyles({ paddingTop: '5px' });
// const Ruling = styled.div({ paddingTop: '5px' });

const container = createStyles({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  fontSize: '16px',
  justifyContent: 'center',
  lineHeight:1
});

// const Container = styled.div({
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
//   fontSize: '16px',
//   justifyContent: 'center',
// });

const test = createStyles({
  display: 'flex',
  justifyContent: 'center',
  overflowX: 'auto',
  width: '100%',
});

// const Test = styled.div({
//   display: 'flex',
//   justifyContent: 'center',
//   overflowX: 'auto',
//   width: '100%',
// });
const imageContainer = createStyles({
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
// const ImageContainer = styled.div({
//   display: 'flex',
//   overflow: 'auto',
//   height: '500px',
//   alignItems: 'center',
//   justifyContent: 'center',
//   maxWidth: '700px',
//   '& img': {
//     maxHeight: '100%',
//     maxWidth: '100%',
//     width: 'auto',
//     height: 'auto',
//     objectFit: 'contain',
//   },
// });


const headingStyles = createStyles({
  marginTop: '0px',
  marginBottom: '10px',
});
// const StyledHeading = styled(Heading)({
//   marginTop: '0px',
//   marginBottom: '10px',
// });

// const ButtonContainer = styled.div();

interface TagLinkProps {
  pendingAdd?: boolean;
  pendingRemove?: boolean;
  children: React.ReactNode;
}
const tagLinkStencil = createStencil({
  vars:{},
  base:{
    '& a': {
      
    },
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
  }
})
const TagLink: React.FC<TagLinkProps> = ({ 
  pendingAdd, 
  pendingRemove, 
  children,
  ...elemProps 
}) => {
  // Use the Stencil with appropriate modifiers

  return (
    <span {...elemProps} {...tagLinkStencil({
    pendingAdd: pendingAdd || false,
    pendingRemove: pendingRemove || false,
  })}>
      {children}
    </span>
  );
};

// const TagLink = styled.span<{ $pendingAdd?: boolean; $pendingRemove?: boolean }>(
//   ({ $pendingAdd, $pendingRemove }) => ({
//     '& a': {
//       color: $pendingAdd ? '#28a745' : $pendingRemove ? '#888' : undefined,
//       textDecoration: $pendingRemove ? 'line-through' : undefined,
//       fontWeight: $pendingAdd ? 600 : undefined,
//     },
//   })
// );


const tagRemoveButton = createStyles({
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

// const TagRemoveButton = styled.button({
//   marginLeft: '2px',
//   padding: '0 4px',
//   cursor: 'pointer',
//   background: 'transparent',
//   border: 'none',
//   fontSize: '1.1em',
//   lineHeight: 1,
//   verticalAlign: 'middle',
//   color: '#666',
//   '&:hover': { color: '#c00' },
// });

const tagAddRow = createStyles({
  marginTop: '6px',
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  '& input': { minWidth: '120px' },
});
// const TagAddRow = styled.div({
//   marginTop: '6px',
//   display: 'flex',
//   gap: '8px',
//   alignItems: 'center',
//   '& input': { minWidth: '120px' },
// });


const relatedGrid = createStyles({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  gap: '0px',
  margin: '0 auto',
});
// const RelatedGrid = styled('div')({
//   display: 'flex',
//   flexWrap: 'wrap',
//   justifyContent: 'center',
//   alignItems: 'center',
//   width: '100%',
//   gap: '0px',
//   margin: '0 auto',
// });

const divider = createStyles({
  height: '2px',
  backgroundColor: '#ccc',
  border: 'none',
  marginLeft: '-32px',
  marginRight: '-32px',
});
// const Divider = styled('hr')({
//   height: '2px',
//   backgroundColor: '#ccc',
//   border: 'none',
//   marginLeft: '-32px',
//   marginRight: '-32px',
// });

const separator = createStyles({
  height: '1px',
  backgroundColor: '#ccc',
  border: 'none',
  marginLeft: '-32px',
  marginRight: '-32px',
});
// const Separator = styled('hr')({
//   height: '1px',
//   backgroundColor: '#ccc',
//   border: 'none',
//   marginLeft: '-32px',
//   marginRight: '-32px',
// });

// const IntButton = styled(PrimaryButton)<{ as?: React.ElementType }>({
//   marginLeft: '30px',
//   marginBottom: '15px',
//   borderRadius: '4px',
//   textDecoration: 'none',
//   '&:hover, &:focus, &:active': {
//     textDecoration: 'none',
//   },
// });

const buttonStyles = createStyles({
  marginLeft: '30px',
  marginBottom: '15px',
  borderRadius: '4px',
  textDecoration: 'none',
  '&:hover, &:focus, &:active': {
    textDecoration: 'none',
  },
})


const inputButtonColors: ButtonColors = {
  default: {
    background: inputColors.background,
    border: inputColors.border,
    label: inputColors.text
  },
  hover: {
    background: inputColors.disabled.background,
    border: inputColors.focusBorder,
    label: inputColors.text
  },
  active: {
    background: inputColors.background,
    border: inputColors.border,
    label: inputColors.text
  },
  focus: {
    background: inputColors.disabled.background,
    border: inputColors.focusBorder,
    label: inputColors.text
  },
  disabled: {
    background: inputColors.disabled.background,
    border: inputColors.disabled.border,
    label: inputColors.text
  },
};

const mediumLine = createStyles({
  fontSize: type.levels.body.medium.fontSize,
  fontWeight: type.levels.body.medium.fontWeight,
  marginBlock: '.5rem',
});
const mediumLineMargin = createStyles(mediumLine, { marginRight: '1em' })

const mediumText = createStyles(
  mediumLine,
  {lineHeight: 1.125,}
);
const mediumItalics = createStyles(mediumText, { fontStyle: 'italic' });
const mediumItalicLine = createStyles(mediumLine, { fontStyle: 'italic' });

// const MediumText = styled('div')({
//   fontSize: type.levels.body.medium.fontSize,
//   fontWeight: type.levels.body.medium.fontWeight,
//   marginBlock: '.5rem',
//   lineHeight: 1.125,
// });

// const MediumLine = styled('span')({
//   fontSize: type.levels.body.medium.fontSize,
//   fontWeight: type.levels.body.medium.fontWeight,
//   marginBlock: '.5rem',
// });
// const MediumItalics = styled(MediumText)({ fontStyle: 'italic' });
// const MediumItalicLine = styled(MediumLine)({ fontStyle: 'italic' });

const smallText = createStyles({
  fontSize: type.levels.body.small.fontSize,
  fontWeight: type.levels.body.small.fontWeight,
  marginBlock: '.4rem',
});

// const SmallText = styled('div')({
//   fontSize: type.levels.body.small.fontSize,
//   fontWeight: type.levels.body.small.fontWeight,
//   marginBlock: '.4rem',
// });
// const SmallLine = styled('span')({
//   fontSize: type.levels.body.small.fontSize,
//   fontWeight: type.levels.body.small.fontWeight,
//   marginBlock: '.4rem',
// });

const buttonGroup = createStyles({
  display: 'inline-block',
  flexDirection: 'row',
  marginLeft: '4px',
  verticalAlign: 'top',
});
// const ButtonGroup = styled('div')({
//   display: 'inline-block',
//   flexDirection: 'row',
//   marginLeft: '4px',
//   verticalAlign: 'top',
// });

const editCardButton = createStyles({
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
// const EditCardButton = styled('button')({
//   display: 'block',
//   marginTop: 6,
//   marginBottom: 4,
//   padding: '3px 10px',
//   background: '#fff',
//   border: '1px solid #ccc',
//   borderRadius: 2,
//   fontSize: 12,
//   cursor: 'pointer',
//   '&:hover': { borderColor: '#888' },
// });
