import { HCRelatedCard } from '@hellfall/shared/types';
import { Divider } from '../visual-components/Divider';
import { StyledHeading } from '../visual-components/StyledHeading';
import { HellfallRelatedEntry } from '../../entry/HellfallRelatedEntry';
import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledDiv } from '../../../styling';

export const RelatedCards = ({
  relatedCards,
  sourceCardId,
  onSinglePage,
}: {
  relatedCards?: HCRelatedCard[];
  sourceCardId: string;
  onSinglePage?: boolean;
}) => {
  if (!relatedCards) {
    return null;
  }
  return (
    <>
      <Divider />
      <div>
        <StyledHeading size="small">Related Cards & Tokens</StyledHeading>
        <RelatedGrid>
          {relatedCards
            .filter(e => e.id != sourceCardId)
            .map((entry, i) => (
              <HellfallRelatedEntry
                onClick={(event: React.MouseEvent<HTMLImageElement>) => {
                  if (event.button === 1 || event.metaKey || event.ctrlKey || !onSinglePage) {
                    window.open(`/card/${encodeURIComponent(entry.hcid)}`, '_blank');
                  } else {
                    window.location.href = `/card/${encodeURIComponent(entry.hcid)}`;
                  }
                }}
                key={entry.id}
                id={entry.hcid}
                name={entry.name}
                url={entry.image!}
              />
            ))}
        </RelatedGrid>
      </div>
    </>
  );
};

const relatedGridStyles = createStyles({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  gap: '0px',
  margin: '0 auto',
});
const RelatedGrid = createStyledDiv(relatedGridStyles);
