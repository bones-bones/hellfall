import { Box, ButtonColors, Card, TextProps } from '@workday/canvas-kit-react';
import { SetLegality } from './visual-components/SetLegality';
import { colorsToIndicator, stringToMana } from '../stringToMana.tsx';
import { formatParens, toPlainText } from '@hellfall/shared/utils';
import { HCCard } from '@hellfall/shared/types';
import { system } from '@workday/canvas-tokens-web';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../auth';
import { useCardTagOverrides } from '../hooks/useCardTagOverrides.ts';
import {
  formatDiscordMarkdown,
  formatDiscordMarkdownInline,
  formatDiscordMarkdownInvertedItalics,
  formatDiscordMarkdownInvertedItalicsInline,
} from './markdownFormatter.tsx';
import { PendingChanges } from './PendingChanges.tsx';
import { createStyles } from '@workday/canvas-kit-styling';
import {
  createStyledDiv,
  createStyledDivWithRef,
  createStyledHR,
  createStyledPrimaryButtonLink,
} from '../../styling';
import { TagSection } from './hellfall-card-components/TagSection';
import { CardEditingControls } from './CardEditingControls.tsx';
import { RelatedCards } from './hellfall-card-components/RelatedCards';
import { Divider } from './visual-components/Divider';
import { StyledHeading } from './visual-components/StyledHeading';
import {
  MediumItalicLine,
  MediumItalics,
  MediumLine,
  MediumLineMargin,
  mediumLineMarginStyles,
  MediumText,
  SmallText,
} from './visual-components/TextComponents.tsx';
import { useAtomValue } from 'jotai';
import { cardsAtom } from '../atoms/cardsAtom.ts';
const renderText = (text: string[]) => {
  return text.map((entry, index) => {
    return <MediumText key={index}>{stringToMana(entry)}</MediumText>;
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
  if (card.print_image) {
    imagesToShow.push(card.print_image);
    imageNames.push('print');
  }
  if (card.still_print_image) {
    imagesToShow.push(card.still_print_image);
    imageNames.push('still print');
  }
  if (card.rotated_print_image) {
    imagesToShow.push(card.rotated_print_image);
    imageNames.push('rotated print');
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
    persistEnabled,

    addTag,
    deleteTag,
    loading: tagsLoading,
    error: tagsError,
    changesetSubmitted,
    pendingTagStaging,
  } = useCardTagOverrides(data);
  const [activeImageSide, setActiveImageSide] = useState(0);

  const isContributor = Boolean(user?.isAdmin || user?.isContributor);
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

  // TODO: add handling for flip and aftermath
  const { images: imagesToShow, names: imageNames } = getImages(displayCard);

  return (
    <Container ref={windowRef} key={displayCard.id}>
      {!imagesToShow.length ? (
        <ImageContainerContainer>
          <ImageContainer key="image-container">
            <img
              alt={toPlainText(displayCard)}
              src={displayCard.image!}
              style={{ maxHeight: '500px', maxWidth: maxWidth + 'px' }}
              referrerPolicy="no-referrer"
            />
          </ImageContainer>
        </ImageContainerContainer>
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
                  <MediumText key="rules">{renderText(face.oracle_text.split('\\n'))}</MediumText>
                ))}
              {face.flavor_text &&
                (['*', '_', '~'].some(e => face.flavor_text?.includes(e)) ? (
                  <MediumText key="flavor">
                    {formatDiscordMarkdownInvertedItalics(formatParens(face.flavor_text))}
                  </MediumText>
                ) : (
                  <MediumItalics key="flavor">
                    {renderText(face.flavor_text.split('\\n'))}
                  </MediumItalics>
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
            <SmallText key="creator">
              Creator{displayCard.creators.length == 1 ? '' : 's'}: {displayCard.creators.join(',')}
            </SmallText>
          )}
          {displayCard.artists?.length && (
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
                {displayCard.rulings.split('\\n').map((e, i) => {
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
          <CardEditingControls displayCard={displayCard} persistEnabled={persistEnabled} />
          <TagSection
            displayCard={displayCard}
            tagControls={{
              addTag,
              deleteTag,
              tagsError,
              tagsLoading,
              tagsPersistEnabled: persistEnabled,
              changesetSubmitted,
              pendingTagStaging,
            }}
          />
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
const Ruling = createStyledDiv(rulingStyles);

const containerStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  fontSize: '16px',
  justifyContent: 'center',
  lineHeight: 1,
});
const Container = createStyledDivWithRef(containerStyles);

const imageContainerContainerStyles = createStyles({
  display: 'flex',
  justifyContent: 'center',
  overflowX: 'auto',
  width: '100%',
});
const ImageContainerContainer = createStyledDiv(imageContainerContainerStyles);

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

const ButtonContainer = Box;

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
const LinkButton = createStyledPrimaryButtonLink(linkButtonStyles);

const buttonGroupStyles = createStyles({
  display: 'inline-block',
  flexDirection: 'row',
  marginLeft: '4px',
  verticalAlign: 'top',
});
const ButtonGroup = createStyledDiv(buttonGroupStyles);
