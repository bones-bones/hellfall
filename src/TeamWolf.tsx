<<<<<<< Updated upstream
export const TeamWolf = async (value:string) =>{
    const requestedData = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/1gPM0QMZlToBBs6Clz5Brm3P68NG3xdhfCCm0DrVTJrs/values/WatchWolfWar Log?alt=json&key=${sheetsKey}`
      );
      const asJson = (await requestedData.json()) as any;  
      return asJson;  
}
=======
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
>>>>>>> Stashed changes
