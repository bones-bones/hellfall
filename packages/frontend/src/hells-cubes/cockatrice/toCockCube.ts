// https://github.com/Cockatrice/Cockatrice/wiki/Custom-Cards-&-Sets
import { HCCard, HCCardFace, HCColors, HCLayout, HCRelatedCard } from '@hellfall/shared/types';
import { toExportName } from '@hellfall/shared/utils/textHandling.ts';
import { recursiveAdoption } from '../recursiveAdoption.ts';
import { prettifyXml } from './prettifyXml';
import { getSplitSet } from '../../hellfall/filters/filterSet.ts';
import namesRawData from '@hellfall/shared/data/oracle-names.json';

const hcToCockLayout: Record<HCLayout, string> = {
  normal: 'normal',
  multi: 'split',
  inset: 'adventure',
  prepare: 'prepare',
  token: 'token',
  token_in_inset: 'normal',
  token_on_back: 'normal',
  split: 'split',
  aftermath: 'aftermath',
  meld_part: 'meld',
  meld_result: 'meld',
  multi_token: 'token',
  not_magic: 'token',
  multi_not_magic: 'token',
  emblem: 'token',
  reminder: 'token',
  reminder_on_back: 'normal',
  multi_reminder: 'token',
  stickers: 'token',
  stickers_on_back: 'normal',
  dungeon: 'token',
  dungeon_in_inset: 'normal',
  dungeon_on_back: 'normal',
  real_card_token: 'token',
  real_card_multi_token: 'token',
  checklist: 'token',
  misc: 'token',
  draft_partner: 'draft_partner',
  modal: 'modal_dfc',
  transform: 'transform',
  specialize: 'transform',
  flip: 'flip',
  front: 'normal',
  leveler: 'normal',
  class: 'normal',
  case: 'normal',
  saga: 'normal',
  mutate: 'normal',
  prototype: 'normal',
  battle: 'normal',
  planar: 'normal',
  scheme: 'normal',
  vanguard: 'normal',
  station: 'normal',
};
const subLayouts = ['token'];
const dropLayouts = ['meld', 'draft_partner'];
const alwaysCompressLayouts = ['split', 'aftermath', 'prepare', 'adventure', 'token'];

type CockFaceProps = Record<string, string | number | HCColors> & {
  name: string;
  text: string;
  layout: string;
  type: string;
  maintype: string;
  manacost: string;
  cmc: number;
  colors?: HCColors;
  pt?: string;
  loyalty?: string;
  picurl?: string;
};
type CockCardProps = Record<string, string | CockFaceProps[]> & {
  coloridentity?: string;
  id: string;
  'format-standard'?: 'legal';
  'format-4cb'?: 'legal';
  'format-commander'?: 'legal';
  props: CockFaceProps[];
  related?: CockRelatedProps[];
  token?: '1';
  set: string;
};
type CockRelatedProps = Record<string, string> & {
  id: string;
  name?: string;
  reverse: 'reverse-' | '';
  count?: string;
  attach?: 'transform';
  persistent?: 'persistent';
};

export const toCockCube = ({
  name,
  set,
  allCards,
}: {
  name: string;
  set: string;
  allCards: HCCard.Any[];
}) => {
  const idNames: Record<string, string[]> = {};
  const oracleNames = namesRawData.data;
  /**
   * Checks whether a name is taken
   * @param name name to check
   * @returns whether name is taken
   */
  const nameIsTaken = (name: string): boolean => {
    return oracleNames.includes(name) || Object.values(idNames).some(names => names.includes(name));
  };
  const hcFaceToCockProps = (
    face: HCCard.AnySingleFaced | HCCardFace.MultiFaced
  ): CockFaceProps => {
    const cockFace: CockFaceProps = {
      name: toExportName(face.name),
      text: face.oracle_text.replaceAll(/\\n/g, '\n').replaceAll(/\{(.)\}/g, '$1'),
      layout: hcToCockLayout[face.layout],
      type: face.type_line,
      maintype: face.types?.at(-1) || face.supertypes?.at(-1) || face.subtypes?.at(-1) || '',
      manacost: face.mana_cost,
      cmc: face.mana_value,
    };
    if ('id' in face && face.isActualToken && 'keywords' in face) {
      // for tokens, use their unique id as the name to prevent conflicts
      cockFace.name = face.id;
    }
    if (face.colors.length) {
      cockFace.colors = face.colors;
    }
    if (face.image) {
      cockFace.picurl = face.image;
    }
    if (face.power || face.toughness) {
      cockFace.pt = (face.power || '') + '/' + (face.toughness || '');
    }
    if (face.loyalty || face.defense) {
      cockFace.loyalty = face.loyalty ? face.loyalty : face.defense;
    }
    return cockFace;
  };
  /**
   * merges 2 or more cock face prop objects
   * @param faces array of cock face prop objects to merge
   * @param goingBackwards true when order needs to be flipped (currently only bubsy uses this)
   * @returns merged cock face props
   */
  const mergeCockFaceProps = (faces: CockFaceProps[], goingBackwards?: boolean): CockFaceProps => {
    faces.slice(1).forEach((face, i) => {
      Object.keys(face).forEach(key => {
        if (key == 'layout') {
          if (!subLayouts.includes(face[key]) || goingBackwards) {
            faces[0][key] = face[key];
          }
        } else if (
          ['adventure', 'prepare'].includes(face.layout) &&
          ['cmc', 'colors'].includes(key)
        ) {
        } else if (key == 'maintype') {
        } else if (key == 'cmc') {
          if (!subLayouts.includes(face.layout)) {
            faces[0][key] += face[key];
          }
        } else if (key == 'colors') {
          if (!subLayouts.includes(face.layout)) {
            if (faces[0].colors && face[key]) {
              face[key].forEach(color => {
                if (!faces[0].colors?.includes(color)) {
                  faces[0].colors?.push(color);
                }
              });
            } else if (face[key]) {
              faces[0].colors = face[key];
            }
          }
        } else if (key == 'picurl') {
          if (!faces[0][key] && face[key]) {
            faces[0][key] = face[key];
          }
        } else if (faces[0][key]) {
          if (key !== 'text') {
            const needed = i - ((faces[0][key] as string).match(/ \/\/ /g)?.length || 0);
            if (needed > 0) {
              faces[0][key] += ' // '.repeat(needed);
            }
          }
          faces[0][key] += (key == 'text' ? '\n\n---\n\n' : ' // ') + face[key];
        } else {
          faces[0][key] = ' // '.repeat(i + 1) + face[key];
        }
      });
    });
    return faces[0];
  };
  /**
   * Convert an hc all_parts array to a cockatrice related props array
   * @param all_parts hc all_parts array
  //  * @param persistent whether this card makes persistent tokens
  * @returns cockatrice related props array
  */
  const hcAllPartsToCockRelated = (all_parts: HCRelatedCard[]): CockRelatedProps[] => {
    const cockRelateds: CockRelatedProps[] = [];
    all_parts.forEach(part => {
      switch (part.component) {
        case 'meld_result': {
          const related: CockRelatedProps = {
            id: part.id,
            reverse: '',
            attach: 'transform',
          };
          cockRelateds.push(related);
          break;
        }
        // case 'meld_part': {
        //   const related: CockRelatedProps = {
        //     id: part.id,
        //     reverse: 'reverse-',
        //     attach: 'transform',
        //   };
        //   cockRelateds.push(related);
        //   break;
        // }
        // case 'token': {
        //   const related: CockRelatedProps = {
        //     id: part.id,
        //     reverse: '',
        //   };
        //   if (part.persistent) {
        //     related.persistent = 'persistent';
        //   }
        //   if (part.count) {
        //     related.count = part.count;
        //   }
        //   cockRelateds.push(related);
        //   break;
        // }
        case 'token_maker': {
          const related: CockRelatedProps = {
            id: part.id,
            reverse: 'reverse-',
          };
          if (part.persistent) {
            related.persistent = 'persistent';
          }
          if (part.count) {
            related.count = part.count;
          }
          cockRelateds.push(related);
          break;
        }
      }
    });
    return cockRelateds;
  };
  /**
   * Convert an hc card to cockatrice props
   * @param card card to convert
   * @returns cockatrice props
   */
  const hcCardToCockProps = (card: HCCard.Any): CockCardProps => {
    const cockCard: CockCardProps = {
      coloridentity: card.color_identity.join(''),
      id: card.id,
      props: [],
      set: card.set,
    };
    if (card.isActualToken) {
      cockCard.token = '1';
    }
    Object.entries(card.legalities).forEach(([key, value]) => {
      if (value == 'legal') {
        cockCard['format-' + key] = 'legal';
      }
    });
    if ('card_faces' in card) {
      card.card_faces.forEach(face => cockCard.props.push(hcFaceToCockProps(face)));
    } else {
      cockCard.props.push(hcFaceToCockProps(card));
    }
    // compress/drop layouts that should always be compressed/dropped
    if (cockCard.props.length > 1) {
      for (let i = cockCard.props.length - 1; i > 0; i--) {
        if (dropLayouts.includes(cockCard.props[i].layout)) {
          cockCard.props.splice(i, 1);
        } else if (alwaysCompressLayouts.includes(cockCard.props[i].layout)) {
          cockCard.props[i - 1] = mergeCockFaceProps([cockCard.props[i - 1], cockCard.props[i]]);
          cockCard.props.splice(i, 1);
        }
      }
    }
    // compress flips if necessary
    if (cockCard.props.length > 2 && card.tags?.includes('flip')) {
      for (let i = cockCard.props.length - 1; i > 0; i--) {
        if (cockCard.props[i].layout == 'flip') {
          if (i == 3 && cockCard.props[2].layout == 'transform') {
            cockCard.props[i - 1] = mergeCockFaceProps(
              [cockCard.props[i], cockCard.props[i - 1]],
              true
            );
            cockCard.props.splice(i, 1);
          } else {
            cockCard.props[i - 1] = mergeCockFaceProps([cockCard.props[i - 1], cockCard.props[i]]);
            cockCard.props.splice(i, 1);
          }
        }
      }
    }
    // compress down to 1 side and use front image if there are still too many sides
    if (cockCard.props.length > 2) {
      cockCard.props = [mergeCockFaceProps(cockCard.props)];
      cockCard.props[0].picurl = card.image;
    } else if (!cockCard.props[0].picurl) {
      cockCard.props[0].picurl = card.image;
    }
    if (card.all_parts) {
      cockCard.related = hcAllPartsToCockRelated(card.all_parts);
    }
    // make sure names aren't taken and then store the names
    cockCard.props.forEach((face, i) => {
      if (card.isActualToken) {
        if (cockCard.props.length>1) {
          face.name +='1';
        } else {
          face.name = card.id;
        }
      }
      if (!face.name) {
        face.name = `(${i ? 'Back' : 'Front'} of ${cockCard.props[1 - i].name})`;
      }
      while (nameIsTaken(face.name)) {
        face.name += ' ';
      }
    });
    idNames[cockCard.id] = cockCard.props.map(face => face.name);
    return cockCard;
  };
  /**
   * Adds names to all related entries
   * @param card card props to add related names to
   */
  const addRelatedNames = (card: CockCardProps) => {
    card.related?.forEach(relatedCard => {
      relatedCard.name = relatedCard.id in idNames ? idNames[relatedCard.id][0] : relatedCard.id;
    });
  };

  const xmlDoc = document.implementation.createDocument(null, 'cockatrice_carddatabase');
  xmlDoc.documentElement.setAttribute('version', '4');

  const setsElement = xmlDoc.createElement('sets');

  const setElement = xmlDoc.createElement('set');

  const nameElement = xmlDoc.createElement('name');
  nameElement.textContent = set;

  const longNameElement = xmlDoc.createElement('longname');
  longNameElement.textContent = name;

  const setTypeElement = xmlDoc.createElement('settype');
  setTypeElement.textContent = 'Custom';

  const cardsElement = xmlDoc.createElement('cards');

  recursiveAdoption(xmlDoc.documentElement, [
    setsElement,
    [setElement, [nameElement, longNameElement, setTypeElement]],
    cardsElement,
  ]);

  /**
   * Appends a cockatrice card to the document
   * @param entry Cockatrice card to append
   */
  const appendCockCard = (entry: CockCardProps) => {
    addRelatedNames(entry);
    entry.props.forEach((face, i) => {
      const tempCard = xmlDoc.createElement('card');

      const name = xmlDoc.createElement('name');
      name.textContent = face.name;

      const text = xmlDoc.createElement('text');
      text.textContent = face.text;

      const setElement = xmlDoc.createElement('set');
      setElement.setAttribute('rarity', 'common');
      setElement.setAttribute('picURL', face.picurl || entry.props[0].picurl || '');
      setElement.setAttribute('muid', 'hc' + entry.id + (i ? 'b' : ''));
      setElement.textContent = entry.set;

      const prop = xmlDoc.createElement('prop');

      const layout = xmlDoc.createElement('layout');
      layout.textContent = face.layout;
      prop.appendChild(layout);

      const side = xmlDoc.createElement('side');
      side.textContent = i ? 'back' : 'front';
      prop.appendChild(side);

      const type = xmlDoc.createElement('type');
      type.textContent = face.type;
      prop.appendChild(type);

      const mainType = xmlDoc.createElement('maintype');
      mainType.textContent = face.maintype;
      prop.appendChild(mainType);

      const manaCost = xmlDoc.createElement('manacost');
      manaCost.textContent = face.manacost;
      prop.appendChild(manaCost);

      const cmc = xmlDoc.createElement('cmc');
      cmc.textContent = face.cmc.toString();
      prop.appendChild(cmc);

      if (face.colors?.length) {
        const colors = xmlDoc.createElement('colors');
        colors.textContent = face.colors.join('');
        prop.appendChild(colors);
      }

      if (entry.coloridentity && !i) {
        const colorIdentity = xmlDoc.createElement('coloridentity');
        colorIdentity.textContent = entry.coloridentity;
        prop.appendChild(colorIdentity);
      }

      if (face.pt) {
        const pt = xmlDoc.createElement('pt');
        pt.textContent = face.pt;
        prop.appendChild(pt);
      }

      if (face.loyalty) {
        const loyalty = xmlDoc.createElement('loyalty');
        loyalty.textContent = face.loyalty;
        prop.appendChild(loyalty);
      }

      if (entry['format-standard'] && !i) {
        const standard = xmlDoc.createElement('format-standard');
        standard.textContent = 'legal';
        prop.appendChild(standard);
      }
      if (entry['format-commander'] && !i) {
        const commander = xmlDoc.createElement('format-commander');
        commander.textContent = 'legal';
        prop.appendChild(commander);
      }
      if (entry['format-4cb'] && !i) {
        const fourcb = xmlDoc.createElement('format-4cb');
        fourcb.textContent = 'legal';
        prop.appendChild(fourcb);
      }
      const maybeElements: HTMLElement[] = [];
      if (entry.token) {
        const token = xmlDoc.createElement('token');
        token.textContent = '1';
        maybeElements.push(token);
      }
      if (i) {
        const reverse = xmlDoc.createElement('reverse-related');
        reverse.textContent = entry.props[0].name;
        reverse.setAttribute('attach', 'transform');
        maybeElements.push(reverse);
        // TODO: Replace bubsy check with more general check
        if (
          (!face.picurl && face.layout == 'flip') ||
          face.name == 'Bubsy, Furred Kind // Bubsy, Fractured Furry'
        ) {
          const upsideDown = xmlDoc.createElement('upsidedown');
          upsideDown.textContent = '1';
          maybeElements.push(upsideDown);
        }
      } else {
        if (entry.props.length > 1) {
          const related = xmlDoc.createElement('reverse-related');
          related.textContent = entry.props[1].name;
          related.setAttribute('attach', 'transform');
          maybeElements.push(related);
        }
        if (entry.related) {
          entry.related.forEach(relatedCard => {
            const related = xmlDoc.createElement(relatedCard.reverse + 'related');
            related.textContent = relatedCard.name || relatedCard.id;
            if (relatedCard.count) {
              related.setAttribute('count', relatedCard.count);
            }
            if (relatedCard.attach) {
              related.setAttribute('attach', relatedCard.attach);
            }
            if (relatedCard.persistent) {
              related.setAttribute('persistent', relatedCard.persistent);
            }
            maybeElements.push(related);
          });
        }
      }
      const mainTypeToTableRow: Record<string, number> = {
        Instant: 3,
        Sorcery: 3,
        Creature: 2,
        Land: 0,
      };
      const tablerow = xmlDoc.createElement('tablerow');
      tablerow.textContent = (
        face.maintype in mainTypeToTableRow ? mainTypeToTableRow[face.maintype] : 1
      ).toString();

      recursiveAdoption(tempCard, [name, text, setElement, tablerow, prop, ...maybeElements]);
      cardsElement.appendChild(tempCard);
    });
  };
  const { cards, tokens } = getSplitSet(allCards, set);
  const cockCards = cards.map(card => hcCardToCockProps(card));
  const cockTokens = tokens.map(token => hcCardToCockProps(token));
  cockCards.forEach(card => appendCockCard(card));
  cockTokens.forEach(token => appendCockCard(token));

  const formattedXmlDoc = document.implementation.createDocument(null, '', null);

  // Import nodes from the original document into the new document
  formattedXmlDoc.appendChild(formattedXmlDoc.importNode(xmlDoc.documentElement, true));

  // Serialize the new document to string with indentation
  const formattedXmlString = new XMLSerializer().serializeToString(formattedXmlDoc);

  return prettifyXml(formattedXmlString);
};
