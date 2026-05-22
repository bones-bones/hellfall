import { toDraftmancerCube } from '@hellfall/shared/utils';
import { HCCard } from '@hellfall/shared/types';

export const downloadDraftmancer = ({
  name,
  set,
  cardList,
  allCards,
}: {
  name: string;
  set: string;
  cardList: HCCard.Any[];
  allCards: HCCard.Any[];
}) => {
  const val = toDraftmancerCube({
    name,
    cardList,
    allCards,
    draftMode: set == 'HC6' ? 'commander' : set == 'HCJ' ? 'jumpstart' : undefined,
  });

  const url = 'data:text/plain;base64,' + btoa(unescape(encodeURIComponent(val)));
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  // the filename you want
  a.download = name + ' (Draftmancer).txt';
  document.body.appendChild(a);
  a.click();
};
