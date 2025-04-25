export const TeamWolf = async (value:string) =>{
    const requestedData = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/1gPM0QMZlToBBs6Clz5Brm3P68NG3xdhfCCm0DrVTJrs/values/WatchWolfWar Log?alt=json&key=${sheetsKey}`
      );
      const asJson = (await requestedData.json()) as any;  
      return asJson;  
}