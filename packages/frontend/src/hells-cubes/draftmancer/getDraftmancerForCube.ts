import { toDraftmancerCube } from './toDraftmancer.ts';
import { HCCard } from '@hellfall/shared/types';

export const getDraftmancerForCube = ({
  id,
  name,
  allCards,
}: {
  id: string;
  name: string;
  allCards: HCCard.Any[];
}) => {
  const val = toDraftmancerCube({
    set: id,
    allCards: allCards,
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
