import { CardMap, toDraftmancerCube } from '@hellfall/shared/utils';
import { HCCard, SetCode } from '@hellfall/shared/types';

export const downloadDraftmancer = ({
  name,
  set,
  idList,
  cardMap,
  multMap,
}: {
  name: string;
  set: SetCode;
  idList?: string[];
  cardMap: CardMap;
  multMap?: Map<string, number>;
}) => {
  const val = toDraftmancerCube({
    name,
    set,
    idList,
    cardMap,
    multMap,
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
