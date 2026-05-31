import { CardMap, toDraftmancerCube } from '@hellfall/shared/utils';
import { HCCard, HCSet } from '@hellfall/shared/types';

export const downloadDraftmancer = ({
  name,
  set,
  idList,
  cardMap,
}: {
  name: string;
  set: HCSet;
  idList?: string[];
  cardMap: CardMap;
}) => {
  const val = toDraftmancerCube({
    name,
    set,
    idList,
    cardMap,
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
