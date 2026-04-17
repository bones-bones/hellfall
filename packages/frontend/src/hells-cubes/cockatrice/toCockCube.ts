// https://github.com/Cockatrice/Cockatrice/wiki/Custom-Cards-&-Sets
import { HCCard, HCCardFace, HCColors, HCLayout, HCRelatedCard } from '@hellfall/shared/types';
// import tokens from '@hellfall/shared/data/tokens.json';
import { toExportName } from '@hellfall/shared/utils/textHandling.ts';
import { recursiveAdoption } from '../recursiveAdoption.ts';
import { getLayout } from './getLayout.ts';
import { getTableRow } from './getTableRow.ts';
import { getTableRowForToken } from './getTableRowForToken.ts';
import { prettifyXml } from './prettifyXml';
import { getSplitSet } from '../../hellfall/filterSet.ts';


export const toCockCube = ({
  name,
  set,
  allCards,
}: {
  name: string;
  set: string;
  allCards: HCCard.Any[];
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
  const { cards, tokens } = getSplitSet(allCards, set);

  cards.forEach(entry => {
    const isSplitAndLinkedLayout = entry.layout === 'transform' || entry.layout === 'modal';
    if (isSplitAndLinkedLayout) {
      // Each side is a separate card in the cube
      entry.toFaces().forEach((_, i) => {
        recursiveAdoption(cardsElement, [
          hcCardToCockCard({
            xmlDoc,
            set,
            entry,
            cardsElement,
            sideIndex: i,
            splitAndLinkedLayout: true,
          }),
        ]);
      });
    } else {
      recursiveAdoption(cardsElement, [
        hcCardToCockCard({ xmlDoc, set, entry, cardsElement, sideIndex: 0 }),
      ]);
    }
  });

  tokens.forEach(tokenEntry => {
    const tokenCardEntry = xmlDoc.createElement('card');
    const name = xmlDoc.createElement('name');
    name.textContent = tokenEntry.name.replace(/\*\d+$/, '');

    const setElement = xmlDoc.createElement('set');
    setElement.setAttribute(
      'picURL',
      ('card_faces' in tokenEntry && tokenEntry.card_faces[0].image
        ? tokenEntry.card_faces[0].image
        : tokenEntry.image) || ''
    );

    const type = xmlDoc.createElement('type');
    type.textContent =
      'Token ' +
      ('card_faces' in tokenEntry ? tokenEntry.card_faces[0] : tokenEntry).types?.join(' ');

    const tablerow = xmlDoc.createElement('tablerow');
    tablerow.textContent = getTableRowForToken(
      ('card_faces' in tokenEntry ? tokenEntry.card_faces[0] : tokenEntry).types?.join(' ') || ''
    ).toString();
    const prop = xmlDoc.createElement('prop');
    recursiveAdoption(tokenCardEntry, [name, prop, [type], setElement, tablerow]);

    let used = false;
    tokenEntry.all_parts?.forEach((related: HCRelatedCard) => {
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

const hcToCockLayout:Record<HCLayout,string> = {
  normal:'normal',
  multi:'split',
  inset:'adventure',
  token:'normal',
  token_in_inset:'normal',
}

type CockFaceProps = Record<string,string|number|HCColors> & {
  name:string,
  text:string
  layout:string,
  type:string
  maintype:string,
  manacost:string,
  cmc:number,
  colors?:HCColors,
  pt?:string,
  loyalty?:string,
  picurl?:string,
}
type CockCardProps = {
  coloridentity?:string,
  id:string,
  'format-standard'?:'legal',
  'format-4cb'?:'legal',
  'format-commander'?:'legal',
  props:CockFaceProps[],
}
const hcFaceToCockProps = (face:HCCard.AnySingleFaced|HCCardFace.MultiFaced):CockFaceProps => {
  const cockFace:CockFaceProps = {
    name:toExportName(face.name),
    text:face.oracle_text.replaceAll(/\\n/g, '\n').replaceAll(/\{(.)\}/g, '$1'),
    layout: hcToCockLayout[face.layout],
    type:face.type_line,
    maintype:face.types?.at(-1) || face.supertypes?.at(-1)||face.subtypes?.at(-1) || '',
    manacost:face.mana_cost,
    cmc:face.mana_value,
  };
  if (face.colors.length) {
    cockFace.colors = face.colors;
  }
  if (face.image) {
    cockFace.picurl = face.image;
  }
  if (face.power || face.toughness) {
    cockFace.pt=(face.power || '') + '/' + (face.toughness || '');
  }
  if (face.loyalty || face.defense) {
    cockFace.loyalty=face.loyalty ? face.loyalty:face.defense;
  }
  return cockFace
}

const mergeCockFaceProps= (faces:CockFaceProps[]):CockFaceProps => {
  faces.slice(1).forEach((face,i) => {
    Object.entries(face).forEach(([key,value]) => {
      if (key == 'layout') {
        faces[0][key] = value as string;
      } else if (['adventure','prepare'].includes(face.layout) && ['cmc','colors'].includes(key)) {
      } else if (key == 'maintype') {
      } else if (key == 'cmc') {
        faces[0][key]+=(value as number);
      } else if (key == 'colors') {
        if (faces[0].colors) {
          (value as HCColors).forEach(color => {
            if (!faces[0].colors?.includes(color)) {
              faces[0].colors?.push(color);
            }
          });
        } else {
          faces[0].colors = (value as HCColors);
        }
      } else if (key == 'picurl') {
        if (!faces[0][key]) {
          faces[0][key] = (value as string)
        }
      } else if (faces[0][key]) {
        if (key !== 'text') {
          const needed = (i - 1) - ((faces[0][key] as string).match(/ \\ /g)?.length || 0);
          if (needed > 0) {
            faces[0][key] += ' // '.repeat(needed);
          }
        }
        faces[0][key] += (key == 'text' ? '\n\n---\n\n' : ' // ') + value
      } else {
        faces[0][key] = ' // '.repeat(i-1)+value;
      }
    })
  })
  return faces[0]
}
const hcCardToCockProps = (card:HCCard.Any):CockCardProps => {

}
// const hcCardToCockCard = ({
//   xmlDoc,
//   set,
//   entry,
//   cardsElement,
//   sideIndex,
//   splitAndLinkedLayout = false,
// }: {
//   xmlDoc: XMLDocument;
//   set: string;
//   entry: HCCard.Any;
//   cardsElement: HTMLElement;
//   sideIndex: number;
//   splitAndLinkedLayout?: boolean;
// }) => {
//   const face = entry.toFaces()[sideIndex];

//   const tempCard = xmlDoc.createElement('card');
//   const name = xmlDoc.createElement('name');
//   name.textContent = toExportName(splitAndLinkedLayout ? face.name : entry.name);

//   const text = xmlDoc.createElement('text');
//   text.textContent = face.oracle_text.replace(/\\n/g, '\n').replace(/[{}]/g, '');

//   const setElement = xmlDoc.createElement('set');
//   setElement.setAttribute('rarity', 'common');
//   setElement.setAttribute('picURL', face.image || entry.image!);
//   setElement.textContent = set;
//   const color = xmlDoc.createElement('color');
//   color.textContent = face.colors.join('');

//   const manaCost = xmlDoc.createElement('manacost');
//   manaCost.textContent = face.mana_cost.replace(/\{(.)\}/g, '$1') || '';

//   const mainType = xmlDoc.createElement('maintype');
//   mainType.textContent = face.types?.includes('Creature')
//     ? 'Creature'
//     : face.types?.slice(-1)[0] || '';

//   const cmc = xmlDoc.createElement('cmc');
//   cmc.textContent = entry.mana_value.toString() || '';

//   const type = xmlDoc.createElement('type');
//   type.textContent = face.type_line;

//   let pt = undefined;
//   if (face.types?.includes('Creature')) {
//     pt = xmlDoc.createElement('pt');
//     pt.textContent = `${face.power}/${face.toughness}`;
//   }

//   let loyalty = undefined;
//   if (face.loyalty) {
//     loyalty = xmlDoc.createElement('loyalty');
//     loyalty.textContent = face.loyalty;
//   }

//   let legality = undefined;
//   // TODO: support other types
//   if (entry.legalities.standard == 'legal') {
//     legality = xmlDoc.createElement('format-standard');
//     legality.textContent = 'legal';
//   }

//   const side = xmlDoc.createElement('side');
//   side.textContent = sideIndex === 0 ? 'front' : 'back';

//   const reverseElements: HTMLElement[] = [];

//   // Back → front: if we're not the first side, attach to the front face (transform link).
//   if (
//     (splitAndLinkedLayout && sideIndex !== 0) ||
//     (!splitAndLinkedLayout && (sideIndex !== 0 || entry.toFaces().filter(e => e.image).length > 1))
//   ) {
//     const reverse = xmlDoc.createElement('reverse-related');
//     reverse.textContent = toExportName(entry.toFaces()[0].name); // RIP Farsight
//     reverse.setAttribute('attach', 'transform');
//     reverseElements.push(reverse);
//   }

//   // Front → back: for transform layout, front face also links to each other face.
//   if (splitAndLinkedLayout && sideIndex === 0 && entry.toFaces().length > 1) {
//     for (let i = 1; i < entry.toFaces().length; i++) {
//       const reverse = xmlDoc.createElement('reverse-related');
//       reverse.textContent = toExportName(entry.toFaces()[i].name);
//       reverse.setAttribute('attach', 'transform');
//       reverseElements.push(reverse);
//     }
//   }

//   const layout = xmlDoc.createElement('layout');
//   layout.textContent = splitAndLinkedLayout
//     ? 'normal'
//     : sideIndex > 0
//     ? 'transform'
//     : getLayout(entry);

//   const tablerow = xmlDoc.createElement('tablerow');
//   tablerow.textContent = getTableRow(entry).toString();

//   const prop = xmlDoc.createElement('prop');

//   recursiveAdoption(
//     tempCard,
//     [
//       name,
//       text,
//       prop,

//       [type, mainType, manaCost, cmc, color, layout, side, pt, loyalty, legality].filter(
//         e => e !== undefined
//       ),
//       setElement,
//       ...reverseElements,
//       tablerow,
//     ].filter(e => e !== undefined)
//   );

//   // Add remaining transform-style faces as separate card elements (skip for transform layout; those are already added at top level)
//   if (
//     !splitAndLinkedLayout &&
//     sideIndex === 0 &&
//     entry.toFaces().filter(e => e.image).length > 1 &&
//     !['MR. CRIME 1981 // Felony Theft'].includes(entry.name)
//   ) {
//     for (let i = 1; i < entry.toFaces().length; i++) {
//       recursiveAdoption(cardsElement, [
//         hcCardToCockCard({ xmlDoc, set, entry, cardsElement, sideIndex: i }),
//       ]);
//     }
//   }

//   return tempCard;
// };
const hcCardToCockCard = ({
  xmlDoc,
  set,
  entry,
  cardsElement,
}: {
  xmlDoc: XMLDocument;
  set: string;
  entry: HCCard.Any;
  cardsElement: HTMLElement;
}) => {
  const face = entry.toFaces()[sideIndex];

  const tempCard = xmlDoc.createElement('card');
  const name = xmlDoc.createElement('name');
  name.textContent = toExportName(splitAndLinkedLayout ? face.name : entry.name);

  const text = xmlDoc.createElement('text');
  text.textContent = face.oracle_text.replace(/\\n/g, '\n').replace(/[{}]/g, '');

  const setElement = xmlDoc.createElement('set');
  setElement.setAttribute('rarity', 'common');
  setElement.setAttribute('picURL', face.image || entry.image!);
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
  cmc.textContent = entry.mana_value.toString() || '';

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

  const reverseElements: HTMLElement[] = [];

  // Back → front: if we're not the first side, attach to the front face (transform link).
  if (
    (splitAndLinkedLayout && sideIndex !== 0) ||
    (!splitAndLinkedLayout && (sideIndex !== 0 || entry.toFaces().filter(e => e.image).length > 1))
  ) {
    const reverse = xmlDoc.createElement('reverse-related');
    reverse.textContent = toExportName(entry.toFaces()[0].name); // RIP Farsight
    reverse.setAttribute('attach', 'transform');
    reverseElements.push(reverse);
  }

  // Front → back: for transform layout, front face also links to each other face.
  if (splitAndLinkedLayout && sideIndex === 0 && entry.toFaces().length > 1) {
    for (let i = 1; i < entry.toFaces().length; i++) {
      const reverse = xmlDoc.createElement('reverse-related');
      reverse.textContent = toExportName(entry.toFaces()[i].name);
      reverse.setAttribute('attach', 'transform');
      reverseElements.push(reverse);
    }
  }

  const layout = xmlDoc.createElement('layout');
  layout.textContent = splitAndLinkedLayout
    ? 'normal'
    : sideIndex > 0
    ? 'transform'
    : getLayout(entry);

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
      ...reverseElements,
      tablerow,
    ].filter(e => e !== undefined)
  );

  // Add remaining transform-style faces as separate card elements (skip for transform layout; those are already added at top level)
  if (
    !splitAndLinkedLayout &&
    sideIndex === 0 &&
    entry.toFaces().filter(e => e.image).length > 1 &&
    !['MR. CRIME 1981 // Felony Theft'].includes(entry.name)
  ) {
    for (let i = 1; i < entry.toFaces().length; i++) {
      recursiveAdoption(cardsElement, [
        hcCardToCockCard({ xmlDoc, set, entry, cardsElement, sideIndex: i }),
      ]);
    }
  }

  return tempCard;
};
