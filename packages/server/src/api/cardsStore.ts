import type { HCCard } from '@hellfall/shared/types';
import { readDataJson } from '../lib/loadDataFiles.ts';
import { CardMap } from '@hellfall/shared/utils';
import { cardsData } from '@hellfall/shared/data';

export const cardMap = new CardMap(cardsData.data);

// export const getCardById = async (id: string): Promise<HCCard.Any | undefined> => {
//   return cardMap.get(id.toLowerCase());
// };
