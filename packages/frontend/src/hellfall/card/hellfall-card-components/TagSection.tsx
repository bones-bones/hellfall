import styled from '@emotion/styled';
import { SmallText } from '../visual-components/SmallText';
import { useState } from 'react';
import { PendingTagStaging } from '../../hooks/usePendingChangesets';
import { Link } from 'react-router-dom';
import { HCCard } from '@hellfall/shared/types';
import { useAuth } from '../../../auth';
import { tagsData } from '@hellfall/shared/data';

export const TagSection = ({
  tagControls: {
    addTag,
    deleteTag,
    tagsPersistEnabled,
    tagsError,

    changesetSubmitted,
    pendingTagStaging,
    tagsLoading,
  },
  displayCard,
}: {
  displayCard: HCCard.Any;
  tagControls: {
    addTag: (tag: string) => Promise<void>;
    deleteTag: (tag: string) => Promise<void>;
    tagsError: Error | null;
    tagsPersistEnabled: boolean;
    changesetSubmitted: boolean;
    pendingTagStaging: PendingTagStaging | null;
    tagsLoading: boolean;
  };
}) => {
  const { user } = useAuth();

  const [newTagInput, setNewTagInput] = useState('');
  const [tagActionError, setTagActionError] = useState<string | null>(null);
  return (
    <>
      {tagsLoading && <SmallText>Loading tags…</SmallText>}
      {tagsError && <SmallText style={{ color: '#c00' }}>Could not load tag overrides.</SmallText>}
      {tagActionError && <SmallText style={{ color: '#c00' }}>{tagActionError}</SmallText>}
      <SmallText key="Tags">
        Tags:{' '}
        {displayCard.tags?.map((tagEntry, i, ar) => {
          const pendingRemove = pendingTagStaging?.toRemove.includes(tagEntry);
          return (
            <span key={tagEntry}>
              <TagLink $pendingRemove={pendingRemove}>
                <Link
                  to={`/?${new URLSearchParams([['q', `tag=${tagEntry}`]]).toString()}`}
                  target="_blank"
                >
                  {tagEntry}
                </Link>
              </TagLink>
              {displayCard.tag_notes &&
                tagEntry in displayCard.tag_notes &&
                (displayCard.tag_notes[tagEntry].startsWith('https:') ? (
                  <>
                    <SmallLine> (</SmallLine>
                    <Link to={displayCard.tag_notes[tagEntry]}>
                      {displayCard.tag_notes[tagEntry]}
                    </Link>
                    <SmallLine>)</SmallLine>
                  </>
                ) : (
                  <>
                    <SmallLine> ({displayCard.tag_notes[tagEntry]})</SmallLine>
                  </>
                ))}
              {user && tagsPersistEnabled && (
                <TagRemoveButton
                  type="button"
                  onClick={async () => {
                    setTagActionError(null);
                    try {
                      await deleteTag(tagEntry);
                    } catch {
                      setTagActionError('Failed to remove tag');
                    }
                  }}
                  title="Remove tag"
                  aria-label={`Remove tag ${tagEntry}`}
                >
                  ×
                </TagRemoveButton>
              )}
              {i < ar.length - 1 && ', '}
            </span>
          );
        })}
        {pendingTagStaging?.toAdd.map((tagEntry, i, ar) => (
          <span key={`pending-${tagEntry}`}>
            {(displayCard.tags?.length || i > 0) && ', '}
            <TagLink $pendingAdd>
              <Link
                to={`/?${new URLSearchParams([['q', `tag:${tagEntry}`]]).toString()}`}
                target="_blank"
              >
                +{tagEntry}
              </Link>
            </TagLink>
            {i < ar.length - 1 && ', '}
          </span>
        ))}
      </SmallText>
      {pendingTagStaging && (
        <SmallText style={{ color: '#856404' }}>Staged changes pending review.</SmallText>
      )}
      {user && tagsPersistEnabled && (
        <TagAddRow>
          <input
            type="text"
            list="hellfall-tag-list"
            value={newTagInput}
            onChange={e => setNewTagInput(e.target.value)}
            onKeyDown={async e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const v = newTagInput.trim();
                if (v) {
                  setTagActionError(null);
                  try {
                    await addTag(v);
                    setNewTagInput('');
                  } catch {
                    setTagActionError('Failed to add tag');
                  }
                }
              }
            }}
            placeholder="Add tag..."
            aria-label="Add tag"
          />
          <datalist id="hellfall-tag-list">
            {(tagsData.data as string[]).map(t => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <button
            type="button"
            onClick={async () => {
              const v = newTagInput.trim();
              if (v) {
                setTagActionError(null);
                try {
                  await addTag(v);
                  setNewTagInput('');
                } catch {
                  setTagActionError('Failed to add tag');
                }
              }
            }}
          >
            Add
          </button>
        </TagAddRow>
      )}
      {changesetSubmitted && (
        <SmallText style={{ color: '#28a745', marginTop: 4 }}>
          Change submitted for review.
        </SmallText>
      )}
    </>
  );
};

const SmallLine = styled('span')({
  fontSize: '14px',
  fontWeight: 'normal',
  marginBlock: '.4rem',
});

const TagLink = styled.span<{ $pendingAdd?: boolean; $pendingRemove?: boolean }>(
  ({ $pendingAdd, $pendingRemove }) => ({
    '& a': {
      color: $pendingAdd ? '#28a745' : $pendingRemove ? '#888' : undefined,
      textDecoration: $pendingRemove ? 'line-through' : undefined,
      fontWeight: $pendingAdd ? 600 : undefined,
    },
  })
);

const TagRemoveButton = styled.button({
  marginLeft: '2px',
  padding: '0 4px',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  fontSize: '1.1em',
  lineHeight: 1,
  verticalAlign: 'middle',
  color: '#666',
  '&:hover': { color: '#c00' },
});

const TagAddRow = styled.div({
  marginTop: '6px',
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  '& input': { minWidth: '120px' },
});
