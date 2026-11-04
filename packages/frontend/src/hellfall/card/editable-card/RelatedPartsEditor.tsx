import { useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { FormField } from '@workday/canvas-kit-react/form-field';
import { createStyles } from '@workday/canvas-kit-styling';
import { HCCard, HCRelatedCard, relatedComponent } from '@hellfall/shared/types';
import { CardMap, fixName } from '@hellfall/shared/utils';
import {
  createStyledButton,
  createStyledDiv,
  createStyledInput,
  createStyledLabel,
  createStyledSelect,
  createStyledSpan,
} from '../../../styling';
import { cardsAtom } from '../../atoms/cardsAtom.ts';
import {
  ADDABLE_RELATED_COMPONENTS,
  defaultRelatedComponent,
  relatedPartFromCard,
} from './cardEditFields.ts';

const SEARCH_LIMIT = 12;

function searchCatalog(cards: CardMap, query: string, excludeIds: Set<string>): HCCard.Any[] {
  const q = fixName(query.trim());
  if (q.length < 2) return [];

  const results: HCCard.Any[] = [];
  const seen = new Set<string>();

  const exact = cards.getFromName(q);
  if (exact && !excludeIds.has(exact.id)) {
    results.push(exact);
    seen.add(exact.id);
  }

  for (const name of cards.names()) {
    if (!name.includes(q)) continue;
    const card = cards.getFromName(name);
    if (!card || excludeIds.has(card.id) || seen.has(card.id)) continue;
    results.push(card);
    seen.add(card.id);
    if (results.length >= SEARCH_LIMIT) break;
  }
  return results;
}

export function RelatedPartsEditor({
  card,
  parts,
  originalParts,
  onChange,
}: {
  card: HCCard.Any;
  parts: HCRelatedCard[];
  originalParts: HCRelatedCard[];
  onChange: (parts: HCRelatedCard[]) => void;
}) {
  const cards = useAtomValue(cardsAtom);
  const [query, setQuery] = useState('');
  const [component, setComponent] = useState<relatedComponent>(() => defaultRelatedComponent(card));
  const [pickedId, setPickedId] = useState<string | null>(null);

  const existingIds = useMemo(() => new Set(parts.map(p => p.id)), [parts]);
  const excludeIds = useMemo(() => {
    const ids = new Set(existingIds);
    ids.add(card.id);
    return ids;
  }, [existingIds, card.id]);

  const matches = useMemo(
    () => searchCatalog(cards, query, excludeIds),
    [cards, query, excludeIds]
  );

  const originalById = useMemo(() => new Map(originalParts.map(p => [p.id, p])), [originalParts]);

  const removePart = (id: string) => {
    onChange(parts.filter(p => p.id !== id));
    if (pickedId === id) setPickedId(null);
  };

  const addPicked = () => {
    const target =
      (pickedId ? cards.get(pickedId) : undefined) ??
      matches[0] ??
      cards.getFromName(fixName(query.trim()));
    if (!target || excludeIds.has(target.id)) return;
    onChange([...parts, relatedPartFromCard(target, component)]);
    setQuery('');
    setPickedId(null);
  };

  const setPartComponent = (id: string, next: relatedComponent) => {
    onChange(parts.map(part => (part.id === id ? { ...part, component: next } : part)));
  };

  const namedMatch = cards.getFromName(fixName(query.trim()));
  const canAdd = Boolean(
    (pickedId && cards.get(pickedId) && !excludeIds.has(pickedId)) ||
      matches[0] ||
      (namedMatch && !excludeIds.has(namedMatch.id))
  );

  return (
    <Section>
      {parts.length === 0 ? (
        <EmptyNote>No related cards linked.</EmptyNote>
      ) : (
        <PartList>
          {parts.map(part => {
            const wasPresent = originalById.has(part.id);
            const orig = originalById.get(part.id);
            const changed =
              !wasPresent ||
              (orig != null &&
                (orig.component !== part.component ||
                  orig.count !== part.count ||
                  orig.persistent !== part.persistent));
            return (
              <PartRow key={part.id} data-changed={changed || undefined}>
                <PartInfo>
                  <PartName>
                    {part.name}
                    {part.component === 'self' ? ' (self)' : ''}
                  </PartName>
                  <PartMeta>
                    {part.set} #{part.collector_number} · {part.component}
                  </PartMeta>
                </PartInfo>
                <PartControls>
                  <StyledSelect
                    aria-label={`Component for ${part.name}`}
                    value={part.component}
                    onChange={e => setPartComponent(part.id, e.target.value as relatedComponent)}
                  >
                    {(part.component === 'self'
                      ? (['self', ...ADDABLE_RELATED_COMPONENTS] as const)
                      : ADDABLE_RELATED_COMPONENTS
                    ).map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </StyledSelect>
                  <RemoveButton type="button" onClick={() => removePart(part.id)}>
                    Remove
                  </RemoveButton>
                </PartControls>
              </PartRow>
            );
          })}
        </PartList>
      )}

      <AddBlock>
        <FormField orientation="vertical">
          <Label htmlFor="related-part-search">Add related card</Label>
          <SearchInput
            id="related-part-search"
            value={query}
            placeholder="Search catalog by name..."
            onChange={e => {
              setQuery(e.target.value);
              setPickedId(null);
            }}
          />
        </FormField>
        {matches.length > 0 && (
          <MatchList role="listbox">
            {matches.map(match => (
              <MatchButton
                key={match.id}
                type="button"
                role="option"
                aria-selected={pickedId === match.id}
                data-selected={pickedId === match.id || undefined}
                onClick={() => {
                  setPickedId(match.id);
                  setQuery(match.name);
                }}
              >
                <span>
                  {match.name}
                  <MatchMeta>
                    {' '}
                    {match.set} #{match.collector_number}
                  </MatchMeta>
                </span>
              </MatchButton>
            ))}
          </MatchList>
        )}
        <AddRow>
          <ComponentField>
            <Label htmlFor="related-part-component">Component</Label>
            <StyledSelect
              id="related-part-component"
              value={component}
              onChange={e => setComponent(e.target.value as relatedComponent)}
            >
              {ADDABLE_RELATED_COMPONENTS.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </StyledSelect>
          </ComponentField>
          <AddButton type="button" onClick={addPicked} disabled={!canAdd}>
            Add
          </AddButton>
        </AddRow>
        <Hint>
          Tokens default to linking a <code>token_maker</code>; other cards default to{' '}
          <code>token</code>. Bidirectional links are applied when the change is accepted.
        </Hint>
      </AddBlock>
    </Section>
  );
}

const sectionStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  border: '1px solid #ccc',
  borderRadius: 2,
  padding: '10px 12px',
});
const Section = createStyledDiv(sectionStyles, 'RelatedPartsSection');

const emptyNoteStyles = createStyles({ fontSize: 12, color: '#666', fontStyle: 'italic' });
const EmptyNote = createStyledDiv(emptyNoteStyles, 'RelatedPartsEmpty');

const partListStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});
const PartList = createStyledDiv(partListStyles, 'RelatedPartList');

const partRowStyles = createStyles({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '6px 8px',
  border: '1px solid #ddd',
  borderRadius: 2,
  background: '#fff',
  '&[data-changed]': { border: '1px solid #888', background: '#ffe' },
});
const PartRow = createStyledDiv(partRowStyles, 'RelatedPartRow');

const partInfoStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 0,
  flex: '1 1 160px',
});
const PartInfo = createStyledDiv(partInfoStyles, 'RelatedPartInfo');

const partNameStyles = createStyles({
  fontSize: 13,
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});
const PartName = createStyledSpan(partNameStyles, 'RelatedPartName');

const partMetaStyles = createStyles({ fontSize: 11, color: '#666' });
const PartMeta = createStyledSpan(partMetaStyles, 'RelatedPartMeta');

const partControlsStyles = createStyles({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flex: '0 0 auto',
});
const PartControls = createStyledDiv(partControlsStyles, 'RelatedPartControls');

const inputStyles = {
  padding: '4px 8px',
  boxSizing: 'border-box' as const,
  border: '1px solid #ccc',
  borderRadius: '2px',
  fontSize: 14,
  fontFamily: 'inherit',
  background: '#fff',
  width: '100%',
  height: 'auto',
};

const selectStyles = createStyles({ ...inputStyles, width: 'auto', minWidth: 120 });
const StyledSelect = createStyledSelect(selectStyles, 'RelatedPartSelect');

const searchInputStyles = createStyles(inputStyles);
const SearchInput = createStyledInput(searchInputStyles, 'RelatedPartSearch');

const removeButtonStyles = createStyles({
  padding: '2px 8px',
  border: '1px solid #ccc',
  borderRadius: 2,
  fontSize: 12,
  cursor: 'pointer',
  background: '#fff',
  '&:hover': { borderColor: '#888' },
});
const RemoveButton = createStyledButton(removeButtonStyles, 'RelatedPartRemove');

const addBlockStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  marginTop: 4,
});
const AddBlock = createStyledDiv(addBlockStyles, 'RelatedPartsAddBlock');

const labelStyles = createStyles({ fontSize: 12, fontWeight: 600, color: '#555' });
const Label = createStyledLabel(labelStyles, 'RelatedPartsLabel');

const matchListStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  maxHeight: 160,
  overflowY: 'auto',
  border: '1px solid #ddd',
  borderRadius: 2,
  background: '#fafafa',
});
const MatchList = createStyledDiv(matchListStyles, 'RelatedPartMatches');

const matchButtonStyles = createStyles({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '4px 8px',
  border: 'none',
  background: 'transparent',
  fontSize: 13,
  cursor: 'pointer',
  '&:hover': { background: '#eee' },
  '&[data-selected]': { background: '#e8d6ff' },
});
const MatchButton = createStyledButton(matchButtonStyles, 'RelatedPartMatch');

const matchMetaStyles = createStyles({ fontSize: 11, color: '#666' });
const MatchMeta = createStyledSpan(matchMetaStyles, 'RelatedPartMatchMeta');

const addRowStyles = createStyles({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  gap: 8,
});
const AddRow = createStyledDiv(addRowStyles, 'RelatedPartsAddRow');

const componentFieldStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  flex: '1 1 140px',
});
const ComponentField = createStyledDiv(componentFieldStyles, 'RelatedPartComponentField');

const addButtonStyles = createStyles({
  padding: '4px 14px',
  border: '1px solid #ccc',
  borderRadius: 2,
  fontSize: 13,
  cursor: 'pointer',
  background: '#fff',
  '&:hover:not(:disabled)': { borderColor: '#888' },
  '&:disabled': { opacity: 0.4, cursor: 'default' },
});
const AddButton = createStyledButton(addButtonStyles, 'RelatedPartAdd');

const hintStyles = createStyles({ fontSize: 11, color: '#666', lineHeight: 1.4 });
const Hint = createStyledDiv(hintStyles, 'RelatedPartsHint');
