import { useState, useEffect } from 'react';
import { usePaginationModel, getLastPage } from '@workday/canvas-kit-react/pagination';
import { HCCard } from '@hellfall/shared/types';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  queryAtom,
  pageAtom,
  inputSortAtom,
  summaryAtom,
  invalidAtom,
} from '../atoms/searchAtoms.ts';
import { searchPageCardsAtom } from '../atoms/searchPageCardsAtom.ts';
import { CHUNK_SIZE } from '../constants.ts';
import { getAuthApiUrl } from '../../auth/getAuthApiUrl';

type SearchResponse = {
  object?: string;
  total_cards?: number;
  details?: string;
  warnings?: string[];
  data?: HCCard.Any[];
  offset?: number;
  limit?: number;
};

function summaryFromDetails(details: string | undefined, total: number): string {
  if (!details) return '';
  const prefix = `${total} card${total != 1 ? 's' : ''}`;
  if (details.startsWith(prefix)) {
    return details.slice(prefix.length).trim();
  }
  return details;
}

function warningsToInvalids(warnings: string[] | undefined): [string, string][] {
  if (!warnings?.length) return [];
  // HellFall skips the "Invalid expression" prefix when [0] starts with "invalid".
  return warnings.map(w => ['invalid', w] as [string, string]);
}

function toPageCardMap(cards: HCCard.Any[]): Map<string, HCCard.Any> {
  const map = new Map<string, HCCard.Any>();
  for (const card of cards) {
    map.set(card.id, card);
  }
  return map;
}

/**
 * Server-backed HellFall search. `resultSet` is the current page only;
 * use `totalCards` for counts / lastPage (not resultSet.length).
 */
export const useServerSearchResults = () => {
  const [resultSet, setResultSet] = useState<HCCard.Any[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const query = useAtomValue(queryAtom);
  const inputSorts = useAtomValue(inputSortAtom);
  const [page, setPageAtom] = useAtom(pageAtom);
  const setSummary = useSetAtom(summaryAtom);
  const setInvalids = useSetAtom(invalidAtom);
  const setPageCards = useSetAtom(searchPageCardsAtom);

  const lastPage = getLastPage(CHUNK_SIZE, totalCards);

  const paginationModel = usePaginationModel({
    lastPage,
    onPageChange: (pageNumber: number) => {
      if (pageNumber < 1) return;
      const newPageIndex = (pageNumber - 1) * CHUNK_SIZE;
      setPageAtom(newPageIndex);
    },
  });

  useEffect(() => {
    const base = getAuthApiUrl().replace(/\/$/, '');
    if (!base) {
      console.error('[useServerSearchResults] REACT_APP_AUTH_API_URL is empty');
      setResultSet([]);
      setTotalCards(0);
      setPageCards(new Map());
      return;
    }

    const ac = new AbortController();
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('limit', String(CHUNK_SIZE));
    params.set('offset', String(page));
    params.set('exclude', 'offensive');
    for (const order of inputSorts) {
      params.append('order', order);
    }

    (async () => {
      try {
        const res = await fetch(`${base}/api/cards/search?${params.toString()}`, {
          signal: ac.signal,
        });
        if (!res.ok) {
          throw new Error(`search failed: ${res.status}`);
        }
        const json = (await res.json()) as SearchResponse;
        if (ac.signal.aborted) return;

        const data = json.data ?? [];
        const total = json.total_cards ?? data.length;
        setResultSet(data);
        setTotalCards(total);
        setPageCards(toPageCardMap(data));
        setSummary(summaryFromDetails(json.details, total));
        setInvalids(warningsToInvalids(json.warnings));

        const currentPageNumber = Math.floor(page / CHUNK_SIZE) + 1;
        if (paginationModel.state.currentPage !== currentPageNumber) {
          paginationModel.events.goTo(currentPageNumber);
        }
        if (total < page && total > 0) {
          paginationModel.events.goTo(1);
          setPageAtom(0);
        }
      } catch (err) {
        if (ac.signal.aborted) return;
        console.error('[useServerSearchResults]', err);
        setResultSet([]);
        setTotalCards(0);
        setPageCards(new Map());
      }
    })();

    return () => ac.abort();
  }, [query, inputSorts, page]);

  return { resultSet, totalCards, paginationModel, paged: true as const };
};
