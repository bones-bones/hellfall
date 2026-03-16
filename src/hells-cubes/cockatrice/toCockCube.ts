// https://github.com/Cockatrice/Cockatrice/wiki/Custom-Cards-&-Sets
import { HCCard } from '../../api-types';
import tokens from '../../data/tokens.json';
import { recursiveAdoption } from '../recursiveAdoption';
import { getLayout } from './getLayout';
import { getTableRow } from './getTableRow';
import { getTableRowForToken } from './getTableRowForToken';
import { prettifyXml } from './prettifyXml';
export const toCockCube = ({
  name,
  set,
  cards,
}: {
  name: string;
  set: string;
  cards: HCCard.Any[];
}) => {
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

  cards.forEach(entry => {
    recursiveAdoption(cardsElement, [
      hcCardToCockCard({ xmlDoc, set, entry, cardsElement, sideIndex: 0 }),
    ]);
  });

  tokens.data.forEach(tokenEntry => {
    const tokenCardEntry = xmlDoc.createElement('card');
    const name = xmlDoc.createElement('name');
    name.textContent = tokenEntry.name.replace(/\*\d+$/, '');

    const setElement = xmlDoc.createElement('set');
    setElement.setAttribute('picURL', tokenEntry.image);

    const type = xmlDoc.createElement('type');
    type.textContent = 'Token ' + tokenEntry.types?.join(' ');

    const tablerow = xmlDoc.createElement('tablerow');
    tablerow.textContent = getTableRowForToken(tokenEntry.types?.join(' ') || '').toString();
    const prop = xmlDoc.createElement('prop');
    recursiveAdoption(tokenCardEntry, [name, prop, [type], setElement, tablerow]);

    let used = false;
    tokenEntry.all_parts?.forEach(related => {
      const relatedEntry = xmlDoc.createElement('reverse-related');
      relatedEntry.textContent = related.name;
      if (cards.find(entry => related.name == entry.name)?.tags?.includes('persistent-tokens')) {
        relatedEntry.setAttribute('persistent', 'persistent');
      }

      const count = /(.*)(\*\d)$/.exec(related.name);
      if (count) {
        relatedEntry.setAttribute('count', '' + count);
      }

      tokenCardEntry.appendChild(relatedEntry);
      used = true;
    });

    if (used) {
      cardsElement.appendChild(tokenCardEntry);
    }
  });

  const formattedXmlDoc = document.implementation.createDocument(null, '', null);

  // Import nodes from the original document into the new document
  formattedXmlDoc.appendChild(formattedXmlDoc.importNode(xmlDoc.documentElement, true));

  // Serialize the new document to string with indentation
  const formattedXmlString = new XMLSerializer().serializeToString(formattedXmlDoc);

  return prettifyXml(formattedXmlString);
};



const hcCardToCockCard = ({
  xmlDoc,
  set,
  entry,
  cardsElement,
  sideIndex,
}: {
  xmlDoc: XMLDocument;
  set: string;
  entry: HCCard.Any;
  cardsElement: HTMLElement;
  sideIndex: number;
}) => {
  const face = entry.toFaces()[sideIndex];

  const tempCard = xmlDoc.createElement('card');
  const name = xmlDoc.createElement('name');
  name.textContent = entry.name;
  console.log(entry, face)

  const text = xmlDoc.createElement('text');
  text.textContent = face.oracle_text.replace(/\\n/g, '\n').replace(/[{}]/g, '');

  const setElement = xmlDoc.createElement('set');
  setElement.setAttribute('rarity', 'common');
  setElement.setAttribute('picURL', face.image!);
  setElement.textContent = set;
  const color = xmlDoc.createElement('color');
  color.textContent = face.colors.join('');

  const manaCost = xmlDoc.createElement('manacost');
  manaCost.textContent = face.mana_cost.replace(/\{(.)\}/g, '$1') || '';

  const mainType = xmlDoc.createElement('maintype');
  mainType.textContent = face.types?.includes('Creature')
    ? 'Creature'
    : face.types?.slice(-1)[0] || '';
  const cmc = xmlDoc.createElement('cmc');
  cmc.textContent = entry.cmc.toString() || '';
  const type = xmlDoc.createElement('type');
  type.textContent = face.type_line;

  let pt = undefined;
  if (face.types?.includes('Creature')) {
    pt = xmlDoc.createElement('pt');
    pt.textContent = `${face.power}/${face.toughness}`;
  }

  let loyalty = undefined;
  if (face.loyalty) {
    loyalty = xmlDoc.createElement('loyalty');
    loyalty.textContent = face.loyalty;
  }

  let legality = undefined;
  // TODO: support other types
  if (entry.legalities.standard == 'legal') {
    legality = xmlDoc.createElement('format-standard');
    legality.textContent = 'legal';
  }

  const side = xmlDoc.createElement('side');
  side.textContent = sideIndex === 0 ? 'front' : 'back';

  let reverse;

  // If we're not processing the first side, then we need to attach each side to the original
  // augh this sucks, printable image should have had a different name
  if (sideIndex !== 0 || entry.toFaces().filter(e => e.image).length > 1) {
    reverse = xmlDoc.createElement('reverse-related');
    reverse.textContent = entry.toFaces()[0].name; // RIP Farsight
    reverse.setAttribute('attach', 'transform');
  }

  const layout = xmlDoc.createElement('layout');
  layout.textContent = sideIndex > 0 ? 'transform' : getLayout(entry);

  const tablerow = xmlDoc.createElement('tablerow');
  tablerow.textContent = getTableRow(entry).toString();

  const prop = xmlDoc.createElement('prop');

  recursiveAdoption(
    tempCard,
    [
      name,
      text,
      prop,

      [type, mainType, manaCost, cmc, color, layout, side, pt, loyalty, legality].filter(
        e => e !== undefined
      ),
      setElement,
      reverse,
      tablerow,
    ].filter(e => e !== undefined)
  );

  if (
    sideIndex == 0 &&
    entry.toFaces().filter(e => e.image).length > 1 &&
    !['MR. CRIME 1981 // Felony Theft'].includes(entry.name)
  ) {
    // TODO: make sure this works
    for (let i = 1; i < entry.toFaces().length - 1; i++) {
      recursiveAdoption(cardsElement, [
        hcCardToCockCard({ xmlDoc, set, entry, cardsElement, sideIndex: i }),
      ]);
    }
  }

  return tempCard;
};
