import { Box, ButtonColors, Card } from '@workday/canvas-kit-react';
import { SetLegality } from './visual-components/SetLegality';
import { toFaces, toPlainText } from '@hellfall/shared/utils';
import { HCCard } from '@hellfall/shared/types';
import { system } from '@workday/canvas-tokens-web';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../auth';
import { useCardTagOverrides } from '../hooks/useCardTagOverrides.ts';
import { PendingChanges } from './PendingChanges.tsx';
import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledDiv, createStyledHR, createStyledPrimaryButtonLink } from '../../styling';
import { TagSection } from './hellfall-card-components/TagSection';
import { CardEditingControls } from './editable-card';
import { ImageUploadControl, type ImageTarget } from './editable-card';
import { RelatedCards } from './hellfall-card-components/RelatedCards';
import { Divider, Separator } from './visual-components/Divider';
import { StyledHeading } from './visual-components/StyledHeading';
import { MediumText, SmallLine, SmallText } from './visual-components/TextComponents.tsx';
import { useAtomValue } from 'jotai';
import { cardsAtom } from '../atoms/cardsAtom.ts';
import { Link } from 'react-router-dom';
import { CardFaceContainer } from './hellfall-card-components/CardFace.tsx';
type ImageEntry = { url: string; label: string; target: ImageTarget };

const getImages = (card: HCCard.Any): ImageEntry[] => {
  const entries: ImageEntry[] = [];
  const push = (url: string | undefined, label: string, target: ImageTarget) => {
    if (url) entries.push({ url, label, target });
  };

  if (!('card_faces' in card) || !('image' in card.card_faces[0])) {
    push(card.image, 'side 1', { label: 'side 1', imageProp: 'image' });
  }
  if ('card_faces' in card) {
    card.card_faces.forEach((face, i) => {
      if (face.image || !i) {
        push(face.image, `side ${i + 1}`, {
          label: `side ${i + 1}`,
          faceIndex: i,
          imageProp: 'image',
        });
      }
      if (face.still_image) {
        push(face.still_image, `side ${i + 1} still`, {
          label: `side ${i + 1} still`,
          faceIndex: i,
          imageProp: 'still_image',
        });
      }
      if (face.rotated_image) {
        push(face.rotated_image, `side ${i + 1} rotated`, {
          label: `side ${i + 1} rotated`,
          faceIndex: i,
          imageProp: 'rotated_image',
        });
      }
    });
    if (card.image && 'image' in card.card_faces[0]) {
      push(card.image, 'full', { label: 'full', imageProp: 'image' });
    }
  }
  push(card.still_image, 'still', { label: 'still', imageProp: 'still_image' });
  push(card.rotated_image, 'rotated', { label: 'rotated', imageProp: 'rotated_image' });
  push(card.print_image, 'print', { label: 'print', imageProp: 'print_image' });
  push(card.still_print_image, 'still print', {
    label: 'still print',
    imageProp: 'still_print_image',
  });
  push(card.rotated_print_image, 'rotated print', {
    label: 'rotated print',
    imageProp: 'rotated_print_image',
  });
  return entries;
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
    persistEnabled,

    addTag,
    deleteTag,
    loading: tagsLoading,
    error: tagsError,
    changesetSubmitted,
    pendingTagStaging,
  } = useCardTagOverrides(data);
  const [activeImageSide, setActiveImageSide] = useState(0);
  const [imageOverrides, setImageOverrides] = useState<Record<number, string>>({});

  const isContributor = Boolean(user?.isAdmin || user?.isContributor);
  const canEditCard = isContributor && persistEnabled && displayCard.kind !== 'scryfall';
  const windowRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const cards = useAtomValue(cardsAtom);
  const otherPrints = cards.getAllPrints(data.oracle_id).cards();

  useEffect(() => {
    if (!windowRef.current) {
      return;
    }

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

  const imageEntries = useMemo(() => getImages(displayCard), [displayCard]);
  const activeEntry = imageEntries[activeImageSide];
  const activeImageUrl =
    imageOverrides[activeImageSide] ?? activeEntry?.url ?? displayCard.image ?? '';

  const tagControls = {
    addTag,
    deleteTag,
    tagsError,
    tagsLoading,
    tagsPersistEnabled: canEditCard,
    changesetSubmitted,
    pendingTagStaging,
  };
  const setDangerously = displayCard.id == 'e1a6c7dc-7f25-4e02-9365-e4f79613e65d';

  return (
    <Container ref={windowRef} key={displayCard.id}>
      {!imageEntries.length ? (
        <ImageContainerContainer>
          <ImageContainer key="image-container">
            <img
              alt={toPlainText(displayCard)}
              src={imageOverrides[0] ?? displayCard.image!}
              style={{ maxHeight: '500px', maxWidth: maxWidth + 'px' }}
              referrerPolicy="no-referrer"
            />
            {canEditCard && displayCard.image?.includes('storage.googleapis.com') && (
              <ImageUploadControl
                cardId={displayCard.id}
                target={{ label: 'image', imageProp: 'image' }}
                onReplaced={url => setImageOverrides(prev => ({ ...prev, 0: url }))}
              />
            )}
          </ImageContainer>
        </ImageContainerContainer>
      ) : (
        <>
          <ImageContainer key={activeImageUrl}>
            <img
              alt={toPlainText(displayCard)}
              src={activeImageUrl}
              style={{ maxHeight: '500px', maxWidth: maxWidth + 'px' }}
              referrerPolicy="no-referrer"
            />
            {canEditCard && activeEntry?.url.includes('storage.googleapis.com') && (
              <ImageUploadControl
                cardId={displayCard.id}
                target={activeEntry.target}
                onReplaced={url => setImageOverrides(prev => ({ ...prev, [activeImageSide]: url }))}
              />
            )}
          </ImageContainer>
          <ButtonContainer>
            {imageEntries.length > 1 &&
              imageEntries.map((entry, i) => {
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveImageSide(i);
                    }}
                    disabled={i === activeImageSide}
                  >
                    {entry.label}
                  </button>
                );
              })}
            {imageEntries.length <= 1 && <Spacer />}
          </ButtonContainer>
        </>
      )}
      <Card cs={cardStyles}>
        <Card.Body cs={cardBodyStyles}>
          {/* {'card_faces' in displayCard && <StyledHeading size="large" style={{whiteSpace: 'pre-wrap'}}>{displayCard.name}</StyledHeading>} */}
          {toFaces(displayCard).map((face, i) => (
            <CardFaceContainer
              key={`face-${i}`}
              face={face}
              i={i}
              setDangerously={setDangerously}
            />
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
            <SmallText key="creator">
              Creator{displayCard.creators.length == 1 ? '' : 's'}:{' '}
              {displayCard.creators.map((creator, i, ar) => (
                <span key={creator}>
                  <Link
                    to={`/?${new URLSearchParams([['q', `creator="${creator}"`]]).toString()}`}
                    target="_blank"
                  >
                    {creator}
                  </Link>
                  {i < ar.length - 1 && ', '}
                </span>
              ))}
            </SmallText>
          )}
          {displayCard.artists?.length && (
            <SmallText key="artist">
              Artist{displayCard.artists.length == 1 ? '' : 's'}:{' '}
              {displayCard.artists.map((artist, i, ar) => (
                <span key={artist}>
                  <Link
                    to={`/?${new URLSearchParams([['q', `artist="${artist}"`]]).toString()}`}
                    target="_blank"
                  >
                    {artist}
                  </Link>
                  {displayCard.artist_notes && artist in displayCard.artist_notes && (
                    <SmallLine> ({displayCard.artist_notes[artist]})</SmallLine>
                  )}
                  {i < ar.length - 1 && ', '}
                </span>
              ))}
            </SmallText>
          )}
          {displayCard.hcid && <SmallText key="hcid">Id: {displayCard.hcid}</SmallText>}
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
                {displayCard.rulings.split('\n').map((e, i) => {
                  return <Ruling key={i}>{e}</Ruling>;
                })}
              </div>
            </>
          )}
          {
            isContributor && (
              <PendingChanges cardId={displayCard.id} />
            ) /* todo: move isContributor into the component */
          }
          <CardEditingControls displayCard={displayCard} canEdit={canEditCard} />
          <TagSection displayCard={displayCard} tagControls={tagControls} />
          <RelatedCards
            relatedCards={displayCard.all_parts ?? []}
            sourceCardId={displayCard.id}
            otherPrints={otherPrints ?? []}
            onSinglePage={onSinglePage}
          />
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
    </Container>
  );
};

const rulingStyles = createStyles({ paddingTop: '5px' });
const Ruling = createStyledDiv(rulingStyles, 'Ruling');

const containerStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  fontSize: '16px',
  justifyContent: 'center',
  lineHeight: 1,
});
const Container = createStyledDiv(containerStyles, 'Container');

const imageContainerContainerStyles = createStyles({
  display: 'flex',
  justifyContent: 'center',
  overflowX: 'auto',
  width: '100%',
});
const ImageContainerContainer = createStyledDiv(
  imageContainerContainerStyles,
  'ImageContainerContainer'
);

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
const ImageContainer = createStyledDiv(imageContainerStyles, 'ImageContainer');

const ButtonContainer = Box;

const cardStyles = createStyles({
  width: '100%',
  borderRadius: '4px',
  borderTop: '3px solid black',
  borderBottom: '3px solid black',
});

const cardBodyStyles = createStyles({
  marginTop: '-12px',
  marginBottom: '-5px',
});

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
    background: system.color.bg.default,
    border: system.color.border.input.default,
    label: system.color.fg.default,
  },
  hover: {
    background: system.color.surface.raised,
    border: system.color.brand.border.primary,
    label: system.color.fg.default,
  },
  active: {
    background: system.color.bg.default,
    border: system.color.border.input.default,
    label: system.color.fg.default,
  },
  focus: {
    background: system.color.surface.raised,
    border: system.color.brand.border.primary,
    label: system.color.fg.default,
  },
  disabled: {
    background: system.color.surface.raised,
    border: system.color.fg.disabled,
    label: system.color.fg.default,
  },
};
const LinkButton = createStyledPrimaryButtonLink(linkButtonStyles, 'LinkButton');

const buttonGroupStyles = createStyles({
  display: 'inline-block',
  flexDirection: 'row',
  marginLeft: '4px',
  verticalAlign: 'top',
});
const ButtonGroup = createStyledDiv(buttonGroupStyles, 'ButtonGroup');
const spacerStyles = createStyles({
  height: '22px',
});
const Spacer = createStyledDiv(spacerStyles, 'Spacer');
