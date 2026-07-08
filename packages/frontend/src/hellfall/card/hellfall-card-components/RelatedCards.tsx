import { HCCard, HCRelatedCard } from '@hellfall/shared/types';
import { Divider, Separator } from '../visual-components/Divider';
import { StyledHeadingLink } from '../visual-components/StyledHeading';
import { HellfallRelatedEntry } from '../../entry/HellfallRelatedEntry';
import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledDiv, createStyledHR } from '../../../styling';

export const RelatedCards = ({
  relatedCards,
  sourceCardId,
  onSinglePage,
  otherPrints,
}: {
  relatedCards: HCRelatedCard[];
  sourceCardId: string;
  onSinglePage?: boolean;
  otherPrints: HCCard.Any[];
}) => {
  if (!relatedCards) {
    return null;
  }
  return (
    <>
      <Divider />
      <div>
        {relatedCards.length > 0 && (
          <>
            <StyledHeadingLink size="small" to={`/?q=~oracleid:${otherPrints[0].oracle_id}`}>
              Related Cards & Tokens
            </StyledHeadingLink>
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
          </>
        )}
        {relatedCards.length > 0 && otherPrints.some(card => card.id != sourceCardId) && (
          <Separator />
        )}
        {otherPrints.some(card => card.id != sourceCardId) && (
          <>
            <StyledHeadingLink size="small" to={`/?q=oracleid:${otherPrints[0].oracle_id}`}>
              Other Prints
            </StyledHeadingLink>
            <RelatedGrid>
              {otherPrints
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
          </>
        )}
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
const RelatedGrid = createStyledDiv(relatedGridStyles, 'RelatedGrid');
