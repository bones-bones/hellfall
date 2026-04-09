import { atom } from 'jotai';
import { HCCard, HCCardFace } from '@hellfall/shared/types';

// @ts-ignore
export const cardsAtom = atom<HCCard.Any[]>(async () => {
  // @ts-ignore
  const { data } = await import('@hellfall/shared/data/Hellscube-Database.json');
  return (data as HCCard.Any[]).map(card => ({
    ...card,
    toFaces(): HCCardFace.MultiFaced[] | [HCCard.AnySingleFaced] {
      return 'card_faces' in this ? this.card_faces : [this];
    },
    // TODO: make these work
    // getPropFromAllFaces<K extends keyof (HCCardFace.MultiFaced | HCCard.AnySingleFaced)>(prop: K): any[]{
    //   return "card_faces" in this ? this.card_faces.map((e)=>(e as HCCardFace.MultiFaced)[prop]) : [this[prop]];
    // },
    // getPropFromAllFacesInclusive<K extends keyof (HCCardFace.MultiFaced | HCCard.Any)>(prop: K): any[]{
    //   return "card_faces" in this ? [...this.card_faces.map((e)=>(e as HCCardFace.MultiFaced)[prop]), ...[(this as HCCard.AnyMultiFaced)[prop]]] : [this[prop]];
    // }
  }));
});
