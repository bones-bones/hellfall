export const ImportInstructions = () => {
  return (
    <>
      To import your deck
      <ol>
        <li>Enter a deck name</li>
        <li>Fill out the box below</li>
        <li>Click Generate Deck Image</li>
        <li>Click Download for TTS</li>
        <li>
          Move the json file to the TTS Saved Objects directory. (Somewhere like{" "}
          {"Tabletop Simulator>Saves>Saved Objects"}){" "}
        </li>
        <li>{"In TTS: Objects > Saved Objects > your file"}</li>
      </ol>
    </>
  );
};
