import { HCEntry, TokenForImport } from './types';

export const tokenToCard = (token: TokenForImport) => {
  const card: HCEntry = {
    Id: token.Name.replace(/(\d+)$/, ' $1'),
    Name: token.Name.replace(/(\d+)$/, ' $1'),
    Image: [token.Image, null, null, null, null],
    Creator: '',
    isActualToken: true,
    Set: '',
    Rulings: 'Related cards: ' + token['Related Cards (Read Comment)'],
    CMC: 0,
    'Color(s)': '',
    Cost: ['', '', '', ''],
    'Supertype(s)': ['Token', '', '', ''],
    'Card Type(s)': [token.Type, '', '', ''],
    'Subtype(s)': ['', '', '', ''],
    power: [token.Power !== '' ? parseInt(token.Power) : null, null, null, null],
    toughness: [token.Toughness !== '' ? parseInt(token.Toughness) : null, null, null, null],
    Loyalty: [null, null, '', ''],
    'Text Box': ['', '', '', ''],
    'Flavor Text': ['', '', '', ''],
    Tags: '',
    'small alt image': '',
    // FIELD44: "",
    // FIELD45: "",
    // FIELD46: "",
    // FIELD47: "",
    // FIELD48: "",
    // FIELD49: "",
    // FIELD50: "",
    // FIELD51: "",
    // FIELD52: "",
    // FIELD53: "",
    // FIELD54: "",
    // FIELD55: "",
    // FIELD56: "",
  };

  return card;
};
