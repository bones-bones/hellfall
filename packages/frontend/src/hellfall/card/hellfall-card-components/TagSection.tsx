import { useState } from 'react';
import { PendingTagStaging } from '../../hooks/usePendingChangesets';
import { Link } from 'react-router-dom';
import { HCCard } from '@hellfall/shared/types';
import { useAuth } from '../../../auth';
import { tagsData } from '@hellfall/shared/data';
import { TextProps } from '@workday/canvas-kit-react';
import { createStenciledSpan, createStyledButton, createStyledDiv } from '../../../styling';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import { SmallLine, SmallText, smallTextStyles } from '../visual-components/TextComponents';

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
      {tagsError && <ErrorText>Could not load tag overrides.</ErrorText>}
      {tagActionError && <ErrorText>{tagActionError}</ErrorText>}
      <SmallText key="Tags">
        Tags:{' '}
        {displayCard.tags?.map((tagEntry, i, ar) => {
          const pendingRemove = pendingTagStaging?.toRemove.includes(tagEntry);
          return (
            <span key={tagEntry}>
              <TagLink pendingRemove={pendingRemove}>
                <Link
                  to={`/?${new URLSearchParams([
                    ['q', `tag=${tagEntry.replaceAll('"', '')}`],
                  ]).toString()}`}
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
        {pendingTagStaging?.toAdd.map((tagEntry, i, ar) => {
          const pendingAdd = pendingTagStaging?.toAdd.includes(tagEntry);

          return (
            <span key={`pending-${tagEntry}`}>
              {(displayCard.tags?.length || i > 0) && ', '}
              <TagLink pendingAdd={pendingAdd}>
                <Link
                  to={`/?${new URLSearchParams([
                    ['q', `tag:${tagEntry.replaceAll('"', '')}`],
                  ]).toString()}`}
                  target="_blank"
                >
                  +{tagEntry}
                </Link>
              </TagLink>
              {i < ar.length - 1 && ', '}
            </span>
          );
        })}
      </SmallText>
      {pendingTagStaging && <PendingText>Staged changes pending review.</PendingText>}
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
      {changesetSubmitted && <SubmittedText>Change submitted for review.</SubmittedText>}
    </>
  );
};

const tagLinkStencil = createStencil({
  vars: {},
  base: {
    '& a': {},
  },
  modifiers: {
    pendingAdd: {
      true: {
        '& a': {
          color: '#28a745',
          fontWeight: '600',
        },
      },
    },
    pendingRemove: {
      true: {
        '& a': {
          color: '#888',
          textDecoration: 'line-through',
        },
      },
    },
  },
});
interface TagLinkProps extends TextProps {
  pendingAdd?: boolean;
  pendingRemove?: boolean;
}
const TagLink = createStenciledSpan<TagLinkProps>(tagLinkStencil, 'TagLink');

const tagRemoveButtonStyles = createStyles({
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
const TagRemoveButton = createStyledButton(tagRemoveButtonStyles, 'TagRemoveButton');

const tagAddRowStyles = createStyles({
  marginTop: '6px',
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  '& input': { minWidth: '120px' },
});
const TagAddRow = createStyledDiv(tagAddRowStyles, 'TagAddRow');

const errorTextStyles = createStyles(smallTextStyles, { color: '#c00' });
const ErrorText = createStyledDiv(errorTextStyles, 'ErrorText');

const pendingTextStyles = createStyles(smallTextStyles, { color: '#856404' });
const PendingText = createStyledDiv(pendingTextStyles, 'PendingText');

const submittedTextStyles = createStyles(smallTextStyles, { color: '#28a745', marginTop: 4 });
const SubmittedText = createStyledDiv(submittedTextStyles, 'SubmittedText');
