import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledHR } from '../styling';
import { useSetUrlSync, useUpdateSetURL } from '../hellfall/hooks/useSetUrlSync.ts';
import { useSetResults } from '../hellfall/hooks/useSetResults.ts';
import { SetControlBar } from '../hellfall/search-controls/SetControlBar.tsx';
import { SetList } from '../hellfall/display/SetList.tsx';

export const CubeResources = () => {
  useUpdateSetURL();
  useSetUrlSync();

  const { resultSet } = useSetResults();
  return (
    <div>
      <br />
      {resultSet.length != 1 && (
        <>
          <SetControlBar setNum={resultSet.length} />
          <SortSeparator />
        </>
      )}
      <SetList sets={resultSet} />
      {resultSet.length != 1 && (
        <>
          <Separator />
          <SetControlBar setNum={resultSet.length} />
        </>
      )}
    </div>
  );
};

const sortSeparatorStyles = createStyles({
  height: '1px',
  backgroundColor: '#ccc',
  border: 'none',
  marginTop: '-20px',
});
const SortSeparator = createStyledHR(sortSeparatorStyles, 'SortSeparator');

const separatorStyles = createStyles({ height: '1px', backgroundColor: '#ccc', border: 'none' });
const Separator = createStyledHR(separatorStyles, 'Separator');
