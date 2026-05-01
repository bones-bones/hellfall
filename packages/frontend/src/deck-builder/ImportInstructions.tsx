export const ImportInstructions = () => {
  return (
    <>
      To import your deck to TTS
      <ol>
        <li>Enter a deck name</li>
        <li>
          Fill out the box below. Use # followed by a space to hide a card. Use % followed by a card
          ID to specify the version.
        </li>
        <li>Click Generate Deck Image or Set Deck</li>
        <li>Click Download for TTS</li>
        <li>
          Move the json file to the TTS Saved Objects directory. (Somewhere like{' '}
          {'Tabletop Simulator>Saves>Saved Objects'}){' '}
        </li>
        <li>{'In TTS: Objects > Saved Objects > your file'}</li>
      </ol>
      <br />
      To import your cube to Draftmancer
      <ol>
        <li>Enter a cube name</li>
        <li>
          Fill out the box below. Use # followed by a space to hide a card. Use % followed by a card
          ID to specify the version.
        </li>
        <li>You can also paste a cardlist directly from Cockatrice ({'Use Deck Editor > Save deck to clipboard > Not Annotated (No set info)'}).</li>
        <li>Click Generate Deck Image or Set Deck</li>
        <li>Click Download for Draftmancer</li>
        <li>In Draftmancer, click Upload a Custom Card List, then choose the file.</li>
      </ol>
    </>
  );
};
