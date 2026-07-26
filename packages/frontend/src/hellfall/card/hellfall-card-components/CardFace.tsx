import { faceType, HCCard } from '@hellfall/shared/types';
import { colorsToIndicator, stringToMana } from '../../stringToMana.tsx';
import { formatParens, toFaces, toPlainText } from '@hellfall/shared/utils';
import {
  FlavorItalics,
  FlavorText,
  MediumItalicLine,
  MediumLine,
  MediumLineMargin,
  mediumLineMarginStyles,
  MediumText,
} from '../visual-components/TextComponents';
import {
  formatDiscordMarkdown,
  formatDiscordMarkdownInline,
  formatDiscordMarkdownInvertedItalics,
  formatDiscordMarkdownInvertedItalicsInline,
} from '../markdownFormatter.tsx';
import { Divider, Separator } from '../visual-components/Divider.tsx';
import { useState } from 'react';

const triggerEscapeList = ['*', '(', '_', '~'];
const renderText = (text: string[]) => {
  return text.map((entry, index) => {
    return <MediumText key={index}>{stringToMana(entry)}</MediumText>;
  });
};

export const CardFace = ({
  face,
  i,
  setDangerously,
}: {
  face: faceType;
  i: number;
  setDangerously?: boolean;
}) => {
  return (
    <span key={'face-' + (i + 1)}>
      {i > 0 && <Divider />}
      {face.name &&
        (setDangerously ? (
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
            <MediumItalicLine key="flavor-name">{stringToMana(face.flavor_name)}</MediumItalicLine>
          </>
        ))}
      {'   '}
      {(face.color_indicator || face.type_line) && <Separator />}
      {face.color_indicator && (
        <>
          <MediumLine key="color-indicator">{colorsToIndicator(face.color_indicator)}</MediumLine>{' '}
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
        (setDangerously ? (
          <MediumText key="rules">
            {formatDiscordMarkdown(
              formatParens(face.oracle_text),
              text =>
                text.replaceAll(
                  'HTML Injection in the Hellfall Website Elemental',
                  face.name.replaceAll('2em', 'em')
                ),
              true,
              true
            )}
          </MediumText>
        ) : triggerEscapeList.some(e => face.oracle_text.includes(e)) ? (
          <MediumText key="rules">
            {formatDiscordMarkdown(formatParens(face.oracle_text), undefined, false, true)}
          </MediumText>
        ) : (
          <MediumText key="rules">{renderText(face.oracle_text.split('\n'))}</MediumText>
        ))}
      {face.flavor_text &&
        (['*', '_', '~'].some(e => face.flavor_text?.includes(e)) ? (
          <FlavorText key="flavor">
            {formatDiscordMarkdownInvertedItalics(formatParens(face.flavor_text))}
          </FlavorText>
        ) : (
          <FlavorItalics key="flavor">{renderText(face.flavor_text.split('\n'))}</FlavorItalics>
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
  );
};

export const CardFaceContainer = ({
  face,
  i,
  setDangerously,
}: {
  face: faceType;
  i: number;
  setDangerously?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  if (face.drop_face) {
    if (isOpen) {
      return (
        <>
          <Divider />
          <button
            key={`face-${i}-button`}
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Hide {face.name}
          </button>
          <CardFace face={face} i={i} setDangerously={setDangerously} />
        </>
      );
    } else {
      return (
        <div>
          <Divider />
          <button
            key={`face-${i}-button`}
            onClick={() => {
              setIsOpen(true);
            }}
          >
            Show {face.name}
          </button>
        </div>
      );
    }
  } else {
    return <CardFace face={face} i={i} setDangerously={setDangerously} />;
  }
};
