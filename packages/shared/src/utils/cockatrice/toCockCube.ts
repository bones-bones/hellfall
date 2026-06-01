// https://github.com/Cockatrice/Cockatrice/wiki/Custom-Cards-&-Sets
import { DOMParser, XMLSerializer } from 'xmldom';
import { HCCard, SetCode } from '@hellfall/shared/types';
import { CockCardProps } from './cockTypes';
import { CardMap, getRelatedsFromCards, getRelatedsFromSet } from '../cardHandling';
import { hcCardToCockProps } from './HCToCockCard';
import { prettifyXml } from './prettifyXml';
import { makeSort } from '@hellfall/shared/filters';

type RecursiveChild = (Node | RecursiveChild)[];

export const recursiveAdoption = (parent: Node, children: RecursiveChild) => {
  for (let i = 0; i < children.length; i++) {
    if (children[i] instanceof Array) {
      recursiveAdoption(children[i - 1] as Node, children[i] as RecursiveChild);
    } else {
      parent.appendChild(children[i] as Node);
    }
  }
};

export const toCockCubeJSON = (
  cardMap: CardMap,
  set?: SetCode,
  idList?: string[]
): { cards: CockCardProps[]; tokens: CockCardProps[] } => {
  const { cards: HCCards, tokens: HCTokens } =
    set && (cardMap.hasSet(set) || set == 'HC5')
      ? getRelatedsFromSet(set, cardMap)
      : idList?.length
      ? getRelatedsFromCards(idList, cardMap)
      : { cards: cardMap, tokens: new CardMap() };
  const cockCards = HCCards.mapToIdMap(card => hcCardToCockProps(card));
  const cockTokens = HCTokens.mapToIdMap(token => hcCardToCockProps(token));
  const addRelatedNames = (card: CockCardProps) => {
    card.related?.forEach(relatedCard => {
      relatedCard.name =
        cockCards.get(relatedCard.id)?.props[0].name ??
        cockTokens.get(relatedCard.id)?.props[0].name;
    });
  };
  cockCards.forEach(card => addRelatedNames(card));
  cockTokens.forEach(token => addRelatedNames(token));
  const cards = Array.from(cockCards.values());
  const tokens = Array.from(cockTokens.values());
  /**
   * Adds names to all related entries
   * @param card card props to add related names to
   */
  return { cards, tokens };
};

export const toCockCube = ({
  name,
  cardMap,
  set,
  idList,
}: {
  name: string;
  cardMap: CardMap;
  set: SetCode;
  idList?: string[];
}) => {
  const xmlDoc = new DOMParser().parseFromString(
    '<cockatrice_carddatabase version="2"/>',
    'application/xml'
  );
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
    entry.props.forEach((face, i) => {
      const tempCard = xmlDoc.createElement('card');

      const name = xmlDoc.createElement('name');
      name.textContent = face.name;

      const text = xmlDoc.createElement('text');
      text.textContent = face.text;

      const setElement = xmlDoc.createElement('set');
      setElement.setAttribute('rarity', 'common');
      setElement.setAttribute('picURL', face.picurl || entry.props[0].picurl || '');
      setElement.setAttribute('uuid', entry.id);
      setElement.setAttribute('muid', 'hc' + entry.hcid + (i ? 'b' : ''));
      if (entry.collector_number) {
        setElement.setAttribute('num', entry.collector_number);
      }
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
        instant: 3,
        sorcery: 3,
        creature: 2,
        land: 0,
      };
      const tablerow = xmlDoc.createElement('tablerow');
      tablerow.textContent = (
        face.maintype.toLowerCase() in mainTypeToTableRow
          ? mainTypeToTableRow[face.maintype.toLowerCase()]
          : 1
      ).toString();

      recursiveAdoption(tempCard, [name, text, setElement, tablerow, prop, ...maybeElements]);
      cardsElement.appendChild(tempCard);
    });
  };
  // const { cards, tokens } =
  // set == 'HC5' ? { cards: getHc5(), tokens: [] } : getSplitSet(allCards, set);
  const { cards, tokens } = toCockCubeJSON(
    cardMap,
    cardMap.hasSet(set as SetCode) || set == 'HC5' ? set : undefined,
    idList
  );
  cards.forEach(card => appendCockCard(card));
  tokens.forEach(token => appendCockCard(token));

  // Import nodes from the original document into the new document
  // formattedXmlDoc.appendChild(formattedXmlDoc.importNode(xmlDoc.documentElement, true));

  // Serialize the new document to string with indentation
  const formattedXmlString = new XMLSerializer().serializeToString(xmlDoc);

  return prettifyXml('<?xml version="1.0" encoding="UTF-8"?>\n' + formattedXmlString);
};
