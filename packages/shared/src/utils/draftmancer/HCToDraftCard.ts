import { HCCard, HCCardFace } from '@hellfall/shared/types';
import { DraftmancerCardFace, DraftmancerCustomCard } from './draftTypes';
import { canBeACommander, hasTokenHCID } from '../cardHandling';
import { stripSingleSlashes, toExportMana } from '../textHandling';
import { orderColors } from '../pipsAndColors';
const validColors = ['W', 'U', 'B', 'R', 'G'];

/**
 * Converts a single-faced card into a {@linkcode DraftmancerCustomCard}
 * @param card card to convert
 */
const convertSingleFace = (card: HCCard.AnySingleFaced): DraftmancerCustomCard => {
  const draftCard: DraftmancerCustomCard = {
    id: card.id,
    name: stripSingleSlashes(card.export_name ?? (hasTokenHCID(card) ? card.hcid : card.name)),
    mana_cost: toExportMana(card.mana_cost, true),
    type: card.type_line,
    image: card.rotated_image || card.image,
    colors: orderColors(card.colors.filter(color => validColors.includes(color))),
    set: card.set,
    oracle_text: toExportMana(card.oracle_text),
  };
  if (card.tags?.includes('rotate-left')) {
    draftCard.layout = 'split-left';
  } else if (card.tags?.includes('rotate') || card.rotated_image) {
    draftCard.layout = 'split';
  }
  if (card.collector_number) {
    draftCard.collector_number = card.collector_number;
  }
  if (card.power) {
    draftCard.power = card.power;
  }
  if (card.toughness) {
    draftCard.toughness = card.toughness;
  }
  if (card.loyalty || card.defense) {
    draftCard.loyalty = card.loyalty || card.defense;
  }
  return draftCard;
};

/**
 * Converts a card face to a {@linkcode DraftmancerCardFace}
 * @param face face to convert
 */
const HCFaceToDraftFace = (face: HCCardFace.MultiFaced): DraftmancerCardFace => {
  const draftFace: DraftmancerCardFace = {
    name: stripSingleSlashes(face.export_name || face.name),
    mana_cost: toExportMana(face.mana_cost, true),
    type: face.type_line,
    image: face.rotated_image || face.image,
    oracle_text: toExportMana(face.oracle_text),
  };
  if (face.layout == 'aftermath') {
    draftFace.layout = 'split-left';
  } else if (face.rotated_image) {
    draftFace.layout = 'split';
  } else if (face.layout == 'flip') {
    draftFace.layout = 'flip';
  }
  if (face.power) {
    draftFace.power = face.power;
  }
  if (face.toughness) {
    draftFace.toughness = face.toughness;
  }
  if (face.loyalty || face.defense) {
    draftFace.loyalty = face.loyalty || face.defense;
  }
  return draftFace;
};

/**
 * Extracts the front of a multifaced card as a {@linkcode DraftmancerCustomCard}
 * @param card card to extract from
 */
const extractFrontFace = (card: HCCard.AnyMultiFaced): DraftmancerCustomCard => {
  const face = card.card_faces[0];
  const draftCard: DraftmancerCustomCard = {
    id: card.id,
    name: stripSingleSlashes(face.export_name ?? (hasTokenHCID(card) ? card.hcid : face.name)),
    mana_cost: toExportMana(face.mana_cost, true),
    type: face.type_line,
    image: face.rotated_image || face.image || card.rotated_image || card.image,
    colors: orderColors(face.colors.filter(color => validColors.includes(color))),
    set: card.set,
    oracle_text: toExportMana(face.oracle_text),
  };
  if (card.tags?.includes('rotate-left') || face.layout == 'aftermath') {
    draftCard.layout = 'split-left';
  } else if (card.tags?.includes('rotate') || card.rotated_image || face.rotated_image) {
    draftCard.layout = 'split';
  } else if (face.layout == 'flip') {
    draftCard.layout = 'flip';
  }
  if (card.collector_number) {
    draftCard.collector_number = card.collector_number;
  }
  if (face.power) {
    draftCard.power = face.power;
  }
  if (face.toughness) {
    draftCard.toughness = face.toughness;
  }
  if (face.loyalty || face.defense) {
    draftCard.loyalty = face.loyalty || face.defense;
  }
  return draftCard;
};

/**
 * Converts a card into a {@linkcode DraftmancerCustomCard}
 * @param card card to convert
 */
export const HCCardToDraftmancerCard = (card: HCCard.Any): DraftmancerCustomCard => {
  const draftCard = 'card_faces' in card ? extractFrontFace(card) : convertSingleFace(card);
  if (canBeACommander(card)) {
    draftCard.canBeACommander = true;
  }
  if ('card_faces' in card && card.card_faces.length > 1) {
    draftCard.back = HCFaceToDraftFace(card.card_faces[1]);
  }
  return draftCard;
};
/**
 * The list of sticker sheet scryfall ids for \_\_\_\_\_\_\_ Balls
 */
export const StickerSheetScryfallIds = [
  '34c3979d-60e7-44b5-bb9f-1b6b0f2b70c3',
  '016bf660-16c3-41b7-a988-211921c21eb8',
  'ca442395-159a-40aa-a1e4-ed6bf0ffbedd',
  'b1710520-d69f-415f-aef8-03eaa514b63a',
  '6534ab2b-ed2e-4c51-914d-920dc2307f43',
  '907157c3-f562-403c-94cb-9171deadaee4',
  '7c7241ef-ccde-4c2f-807b-45b9e644870f',
  'b8f1abc7-1a86-4e43-8105-10c1c55e65ba',
  'eacec01f-c971-48b7-bf4a-2fdacae32835',
  '780b4d5d-d3a0-4aad-abe7-3073339a8fcd',
  'ba3ff3dc-08d6-4ee1-9dcd-38bc95c8b227',
  '992af90e-5ab9-46e1-af1d-c741be2605c3',
  '4fac4b12-4cb6-438e-acd5-f4598f922b65',
  'ca8a24e8-5305-46cf-8c5a-b5324c59bb97',
  '20a67ee2-0137-458d-b381-430a2494357f',
  '1b09757f-22bb-4ae0-874f-67959b537da0',
  'e6952074-d6c2-4fbe-88ca-6d42f83c7ee7',
  '6995d646-cadc-48bb-911c-9f2e461a9fdf',
  '1b516ae7-2891-40e9-80a1-48ec62171275',
  '436e388d-7d48-41b8-8dcc-21ff3755feff',
  '5feced69-a138-4a56-85f2-7c2cbdde5fa6',
  '5daeb14a-dcc5-4761-84a4-a60d22a6c944',
  'c27dffce-908c-45cf-bfe5-67af12467321',
  '7c2526ff-75ae-4d58-9749-ab948dedf2e7',
  'e997ea17-18e3-4d4c-8ab3-0395e44fca9c',
  'aabb17b4-34b5-4920-b290-0c750f868448',
  '8e3a1933-9efb-45dc-997f-c3e4cbb40817',
  '1dca39e2-0001-48bb-88a0-16e40b4877c8',
  'ecae5a63-8494-4454-889c-2a69b98254f2',
  'c65b391d-a5fb-4f0d-8082-cc636ab95b28',
  '14222486-bcd3-42be-9598-4976ec9c08ea',
  'ca27624e-bddf-4719-9d7e-579de18e1084',
  '633f98c3-ffec-48c0-ac01-d599312fe288',
  '96cc18d9-edf1-4cb5-bb0d-a33d380c7d94',
  '7985d1dd-32cf-4c83-ae68-ee4961c1e6b9',
  '955c33c6-0cc6-47ec-8f71-8d169c02b243',
  '04da8455-cfaa-4061-9aea-4c9015baaab4',
  'c3bd4f88-d861-476b-87d6-605f2c0deee0',
  '3bf70946-5a50-4918-bb61-23be7c2cc75a',
  'a5f917b0-3c9a-4643-ade8-ada20dfc2d05',
  'f20010bf-3745-422a-8811-c3f6be9a8805',
  'a4475054-b272-4f05-b626-b7b5090690d9',
  '61a9e71b-cb8e-4cff-b561-3d2462848582',
  '1cd65813-8103-413b-add4-d000101e479d',
  'fa0c5716-a222-41a1-88cf-8b4aae87f92b',
  '9d595a6a-03f6-4da6-945b-4de82d71b298',
  '3af82a50-8f49-4bab-b8f3-da2214d3601d',
  '2eb50148-bfb1-4e79-a6a8-d0ce49763d00',
];
