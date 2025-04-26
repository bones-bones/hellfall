export const TeamWolf = async () => {
  const requestedData = await fetch(
    "https://get-watch-wolf-war-821285593003.us-central1.run.app/"
  );
  const asJson = (await requestedData.json()) as {
    data: { Name: string; Number: number }[];
  };
  return asJson.data
};

export const TeamClock = async (value: string) => {
  const requestedData = await fetch(
    "https://get-watch-wolf-war-821285593003.us-central1.run.app/", {method:"POST", body:JSON.stringify({Name:value})}
  );
  const asJson = (await requestedData.json()) as {
    data: { Name: string; Number: number }[];
  };
  return asJson;
};
