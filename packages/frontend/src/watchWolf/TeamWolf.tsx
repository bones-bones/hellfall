import { getAuthApiUrl } from '../auth/getAuthApiUrl';

function getWatchwolfUrl(): string {
  const base = getAuthApiUrl();
  return base ? `${base}/api/watchwolf` : '';
}

export const TeamWolf = async () => {
  const url = getWatchwolfUrl();
  if (!url) return [];
  const requestedData = await fetch(url);
  const asJson = (await requestedData.json()) as {
    data: { Id: string; Wins: number; Matches: number }[];
  };
  return asJson.data;
};

export const TeamClock = async (winId: string, loseId: string) => {
  const url = getWatchwolfUrl();
  if (!url) return { winId, loseId };
  const requestedData = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ WinId: winId, LoseId: loseId }),
  });
  return (await requestedData.json()) as { winId: string; loseId: string };
};
