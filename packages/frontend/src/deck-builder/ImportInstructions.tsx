export const ImportInstructions = () => {
  return (
    <>
      To build your deck/cube
      <ol>
        <li>Enter a deck/cube name</li>
        <li>
          Fill out the box below. Use # followed by a space to hide a card. Use{' '}
          <code>CardName (SET) Number</code> syntax to specify a printing.
        </li>
        <li>
          Basics are drawn randomly from the Land Box, or you can specify a land's printing to
          choose one.
        </li>
        <li>
          You can also paste a cardlist directly from Cockatrice (
          {'Use Deck Editor > Save deck to clipboard > Not Annotated'}).
        </li>
        <li>Click Generate Deck Image or Set Deck</li>
      </ol>
      <br />
      To import your deck to TTS
      <ol>
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
        <li>Click Generate Deck Image or Set Deck</li>
        <li>Click Download for Draftmancer</li>
        <li>In Draftmancer, click Upload a Custom Card List, then choose the file.</li>
      </ol>
    </>
  );
};
