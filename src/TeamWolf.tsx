export const TeamWolf = async (value: string) => {
  const requestedData = await fetch(
    "https://get-watch-wolf-war-821285593003.us-central1.run.app/"
  );
  const asJson = (await requestedData.json()) as {
    data: { Name: string; Number: number }[];
  };
  return asJson;
};
