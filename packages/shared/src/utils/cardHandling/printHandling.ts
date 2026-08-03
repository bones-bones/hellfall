import { HCLegalitiesField, HCLegality } from '@hellfall/shared/types';
import { DefaultInvariantMap, InvariantMap, printInput, printInvariant } from './invariantMap';
import { textListIsContainedBy } from '../listHandling';
import { CardMap } from './cardMap';

const cardIDList: printInput[] = [
  ['Plains', 'bc71ebf6-2056-41f7-be35-b2e5c34afa99'],
  ['Island', 'b2c6aa39-2d2a-459c-a555-fb48ba993373'],
  ['Swamp', '56719f6a-1a6c-4c0a-8d21-18f7d7350b68'],
  ['Mountain', 'a3fb7228-e76b-4e96-a40e-20b5fed75685'],
  ['Forest', 'b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6'],
  ['Nebula', 'fad3359c-6c3d-4a94-8d7c-4f833d82cb8d'],
  ['Wastes', '05d24b0c-904a-46b6-b42a-96a4d91a0dd4'],
  ['Snow-Covered Plains', 'ac8cc74d-e43b-4118-bba0-dfa8b9c04d45'],
  ['Snow-Covered Island', '5b2460a5-6ae5-4cad-ba94-1a9e98e6e4c0'],
  ['Snow-Covered Swamp', 'd8239a86-7184-4005-ba1e-2dddcd756c47'],
  ['Snow-Covered Mountain', 'ca9f660b-e07d-4f42-a46e-abd0ca72510c'],
  ['Snow-Covered Forest', '5f0d3be8-e63e-4ade-ae58-6b0c14f2ce6d'],
  ['Snow-Covered Nebula', '2c268e90-9bec-45c3-9c99-436761643f3c'],
  ['Snow-Covered Wastes', '46a07b53-ff58-4bd6-80dd-ded2eb0e29a3'],
  ['Thriving Heath', 'd1946630-e224-40db-8f0d-388b09622288'],
  ['Thriving Isle', '69fc70b8-b143-4662-ac95-e2743037239d'],
  ['Thriving Moor', 'b7c7d0c0-ada6-4c89-b47b-977e35e67b39'],
  ['Thriving Bluff', '91fceb34-0f2d-4392-be27-00dcd765637f'],
  ['Thriving Grove', 'a8052556-8962-4130-86a8-6fb7b6a324f7'],
  ['Thriving Galaxy', '626d5aaa-b808-434b-b7ae-bde93811d2df'],
];

const tokenOracleIdList: printInput[] = [
  ['Food', 'a468338f-635e-4206-89d6-72d723071d45'],
  ['Treasure', '3c549374-6c37-42e0-8d88-a8555d46732d'],
  ['Elephant', '079c46cc-feb0-4998-8593-c8b739afdb82'],
  ['Human', '30272edf-097c-4918-84d2-9fa6c42dbe0a'],
  ['Clue', '496e1083-c792-40a4-adf4-fec1d559cd5e'],
  ['Fish', 'bdb03306-355c-41e5-96bc-f60483e59b2a'],
  ['Dog', '791a992f-6f67-41a0-8100-a4a6401e6148'],
  ['Goblin', '4465eff4-5851-4721-a248-866c686c2ab8'],
  ['Snake', '9ecd83ce-f866-4cbe-9712-c44aabe979c6'],
  ['Gold', '5aa757d8-db7a-4a60-b63e-c9777c141953'],
  ['Bear', 'a62a374d-ccdd-418d-9bcd-5ca8bf9b05e8'],
  ['Bird', 'b1a2b096-a440-4ef9-ab2a-059c79999297'], // w
  ['Soldier', 'eac25f12-6459-438c-a09e-93e23d2cf80d'],
  ['Ape', '6736e171-ed7d-4259-8a42-f5936ebad532'],
  ['Sand Warrior', '7705873e-6fe6-4b25-965d-5f3df1680f66'],
  ['Zombie Army', '8bf1137a-163c-446f-8d34-168a7705df4e'],
  ['Wolf', 'b2224843-8274-4872-a7ca-2adf69cc066b'],
  ['Myr', 'bf690282-125f-431c-a363-39f6772324c8'],
  ['Squirrel', '67f21c0c-2083-4eda-9dc3-cc8aee42289f'],
  ['Thopter', '7c0b6b53-4ddb-4bb5-8a26-0041b2006d3f'],
  ['Copy', '88c78601-87f0-45e7-b2e0-e7ffcfb1cb70'],
  ['Skeleton', '8556740e-653e-4866-9e57-5e8da844113f'],
  ['Saproling', '2b7dba01-b08c-4218-9fc1-da55559d9155'],
  ['Bird U', '39593ebf-49ee-4a74-8498-952b43fa5127'],
  ['Servo', 'b6ca7bd1-d72e-4260-8b52-997ee1377279'],
  ['Zombie', 'ddc8c973-c31e-463f-be45-f3fa7d632362'],
  ['Shard', '08734dc6-71d9-46c1-a116-187a92ce3867'],
  ['Phyrexian Mite', '2667d723-01c8-4ea3-ac17-cedb3b842c3b'],
  ['Force of Will', '956381ba-6d37-4a8a-846c-bad79222dbee'],
  ['Goat', 'f62b776a-d4de-455a-ae5a-ca07982974db'],
  ['Rock', '300757bc-5dbf-4d1e-a225-fe3b6e0c9ef4'],
  ['Cat', '5ae6251d-cef9-4fb7-bdcd-e870a062f042'], // w
  ['Elk', '7bdd50bf-55fb-4fe7-9510-b0d8adf2bae9'],
  ['Junk', '7034bca4-8ba0-47a6-886e-ecbd829ddaec'],
  ['Rat', '7c753b68-b519-43ba-9c58-4902f4850626'],
  ['Balloon', '46a178da-30d1-40ea-8a25-f068f7175f17'],
  ['Blood', '03f45075-9423-454f-a256-94dcafb2a779'],
  ['Map', 'c050f054-1ccf-4819-bc30-a928aed60c56'],
  ['Insect', 'c39cd31f-c4a2-4ca8-b4f9-b2e6289743bc'], // g
  ['Pilot', '425c9e23-3227-44a5-8e10-0cf4d0967799'],
  ['Citizen', 'ffbc4833-01db-45f8-b8b4-c2e2c8235d0c'],
  ['Radiation', '7926aa44-a2f1-416a-a4b7-1a6991c15879'],
  ['Cat G', 'd4454ff8-1671-4bf5-a9f2-30c9d997f975'],
  ['Angel', '40c64f08-ab2f-4933-8e0e-d1a1c729008f'],
  ['Poison Counter', '60acebe2-e1e5-478a-ab88-6a9c1409bca5'],
  ['Boo', '53c0975a-a240-4889-a7cb-8bca6dfe5a1b'],
  ['Sword', '092f0002-2f8d-4811-8c2e-60c2dd1e0d20'],
  ['Spirit C', '6a7a9dff-ff9e-4005-a17f-6ea0c11c1d5a'],
  ['Powerstone', '91da73fe-d028-43d7-bf75-f7ef30b45664'],
  ['Human Soldier', 'a4095286-d51b-4527-b6ce-23aa539fc23a'],
  ['Monk', 'bfa57f61-3811-43da-b73e-90e3e5b0b2c2'],
  ['Indicate', '67876214-3777-41b1-935e-75dd5075fa53'],
  ['Devil', '02d1dc2f-625e-4be3-9daf-e48c44bc9bf7'],
  ['Hero', 'fcf819ef-28e4-46be-a28d-5865ff90e15a'],
  ['Eldrazi Spawn', '3aaf906a-e749-4e86-ac79-97650b92f271'],
  ['Eldrazi Scion', '0eb3cd4b-c34e-448c-a9ab-e7b0b4524833'],
  ['Spider', 'bd386399-69f0-4653-96a1-fd05b8fd148c'],
  ['Frog', '5973b38b-9e8b-49ec-b7e9-c3d5a810d93b'],
  ['Storm Crow', '38d87b87-0c67-47a5-8093-b49aa11f6196'],
  ['Bat', 'ff86d8fc-5242-405e-b5e3-f9ff73296794'],
  ['Phyrexian Germ', 'a1c2af93-83c0-4974-b4db-abf95981d4e3'],
  ['Offspring', '9caebd4a-00af-4227-9727-31181f7836df'],
  ['Manifest', 'f4f184ef-f456-47d8-9012-095629a5ea4d'],
  ['Plains Token', 'be611daa-3960-445e-8872-f7915a49669f'],
  ['Island Token', 'b3d6c1b3-49cc-4d63-89c2-166325367773'],
  ['Swamp Token', 'd2724cff-7b87-4f95-abb9-5e7f34f2a0d2'],
  ['Mountain Token', '832cf8d9-0872-46de-868a-89f54e6930b6'],
  ['Forest Token', '92dbbd36-2588-44ef-afb4-25eb6cc2b7b0'],
  ['Nebula Token', 'dc8340f7-88f1-4cda-b5b1-872054eb8925'],
  ['Wastes Token', '8e1687da-24de-460e-9b1a-cc12776476df'],
  ['Goblin Shaman', '4ece8767-a2e0-42fc-aadf-86a4ae863343'],
  ['Undead Servant', '5bf9f397-0216-4ec9-a57b-406758dcc233'],
  ['Baby', 'a0101448-b5ca-47ce-aefe-a7a795c5e005'],
  ['WET Treasure', '9f84cca3-ed45-4878-bd6e-33d2ea570169'],
  ['Weed', '932666fb-45d9-46c2-afeb-b68cabcce864'],
];

export const landNames = [
  'plains',
  'island',
  'swamp',
  'mountain',
  'forest',
  'nebula',
  'wastes',
  'snow-covered plains',
  'snow-covered island',
  'snow-covered swamp',
  'snow-covered mountain',
  'snow-covered forest',
  'snow-covered nebula',
  'snow-covered wastes',
];

export const landInvariantMap = new DefaultInvariantMap(cardIDList);

/**
 * Checks if a card name is the name of a land that can be used with {@linkcode getRandomLand}.
 * @param name name to check
 */
export const isLandName = (name: string) => landInvariantMap.hasName(name);

/**
 * Gets a random land given a land name.
 * @param name name of the land to get
 * @param cardMap CardMap to get the land from
 */
export const getRandomLand = (name: string, cardMap: CardMap) =>
  isLandName(name)
    ? cardMap.getAllPrints(landInvariantMap.getOracleID(name)!).getRandomCard()
    : undefined;

export const tokenInvariantMap = new DefaultInvariantMap(tokenOracleIdList);
