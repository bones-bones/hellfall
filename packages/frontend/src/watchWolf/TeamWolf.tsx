export const TeamWolf = async () => {
  const requestedData = await fetch('https://get-watch-wolf-war-821285593003.us-central1.run.app/');
  const asJson = (await requestedData.json()) as {
    data: { Id: string; Wins: number; Matches: number }[];
  };
  return asJson.data;
};

export const TeamClock = async (winId: string, loseId: string) => {
  const requestedData = await fetch(
    'https://get-watch-wolf-war-821285593003.us-central1.run.app/',
    { method: 'POST', body: JSON.stringify({ WinId: winId, LoseId: loseId }) }
  );
  const asJson = (await requestedData.json()) as {
    data: { Id: string; Wins: number; Matches: number }[];
  };
  return asJson;
};
