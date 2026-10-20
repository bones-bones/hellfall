import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { Heading } from '@workday/canvas-kit-react';
import { createStencil, createStyles, handleCsProp } from '@workday/canvas-kit-styling';
import { formatChangesetDiffValue } from '@hellfall/shared/utils';
import { useAuth } from '../auth';
import { getAuthApiUrl } from '../auth/getAuthApiUrl';
import { cardsAtom } from '../hellfall/atoms/cardsAtom';
import {
  createStenciledButton,
  createStyledButton,
  createStyledDiv,
  createStyledInput,
  createStyledLink,
  createStyledSpan,
} from '../styling';

type AuditEntry = {
  id: string;
  cardId: string;
  at: string | null;
  action: string;
  field: string | null;
  tag: string | null;
  username: string;
  changes: { before: unknown; after: unknown };
};

const ACTIONS = ['all', 'field_edit', 'changeset_accept', 'changeset_reject'] as const;
type ActionFilter = (typeof ACTIONS)[number];

function formatTime(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString();
}

function describeValue(value: unknown): string {
  if (
    value &&
    typeof value === 'object' &&
    'changes' in value &&
    Array.isArray((value as { changes: unknown[] }).changes)
  ) {
    const record = value as { changes: Record<string, unknown>[]; comment?: string | null };
    const lines = record.changes.map(change => {
      const kind = String(change.change_type ?? '');
      if (change.location === 'tag') return `${kind} tag ${change.full_tag ?? ''}`.trim();
      const face = change.location === 'face' ? `face ${change.index ?? ''} ` : '';
      const prop = change.prop != null ? String(change.prop) : String(change.location ?? '');
      const next = change.value != null ? ` → ${formatChangesetDiffValue(change.value)}` : '';
      return `${kind} ${face}${prop}${next}`.trim();
    });
    if (record.comment) lines.unshift(record.comment);
    return lines.join('\n');
  }
  return formatChangesetDiffValue(value);
}

export const AuditPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { '*': cardIdParam } = useParams();
  const cardId = cardIdParam?.trim() || '';
  const navigate = useNavigate();
  const baseUrl = getAuthApiUrl();
  const cards = useAtomValue(cardsAtom);

  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<ActionFilter>('all');
  const [cardQuery, setCardQuery] = useState(cardId);

  const canView = Boolean(user?.isAdmin || user?.isContributor || user?.canSyncCatalog);

  useEffect(() => {
    setCardQuery(cardId);
  }, [cardId]);

  const load = useCallback(async () => {
    if (!baseUrl || !canView) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (cardId) params.set('cardId', cardId);
      params.set('limit', '100');
      const res = await fetch(`${baseUrl}/api/audit?${params.toString()}`, {
        credentials: 'include',
      });
      const data = (await res.json().catch(() => ({}))) as {
        entries?: AuditEntry[];
        detail?: string;
        reason?: string;
      };
      if (!res.ok) {
        throw new Error(data.detail || data.reason || `Error ${res.status}`);
      }
      setEntries(data.entries ?? []);
    } catch (e) {
      setEntries([]);
      setError(e instanceof Error ? e.message : 'Failed to load audit');
    } finally {
      setLoading(false);
    }
  }, [baseUrl, canView, cardId]);

  useEffect(() => {
    if (authLoading) return;
    if (!canView) {
      setLoading(false);
      setEntries([]);
      return;
    }
    void load();
  }, [authLoading, canView, load]);

  const visible = useMemo(
    () => (action === 'all' ? entries : entries.filter(entry => entry.action === action)),
    [action, entries]
  );

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const next = cardQuery.trim();
    navigate(next ? `/audit/${encodeURIComponent(next)}` : '/audit');
  };

  if (!authLoading && !user) {
    return (
      <Page>
        <Heading size="medium">Audit</Heading>
        <p>Log in to view the edit history.</p>
      </Page>
    );
  }

  if (!authLoading && user && !canView) {
    return (
      <Page>
        <Heading size="medium">Audit</Heading>
        <p>You need admin, database contributor, or catalog sync access for this page.</p>
      </Page>
    );
  }

  return (
    <Page>
      <Heading size="medium">Audit</Heading>
      <SearchForm onSubmit={onSearch}>
        <CardInput
          value={cardQuery}
          placeholder="Card id (blank for recent)"
          onChange={event => setCardQuery(event.target.value)}
          aria-label="Card id"
        />
        <SearchButton type="submit">Show</SearchButton>
        {cardId && (
          <ClearLink to="/audit" onClick={() => setCardQuery('')}>
            Recent
          </ClearLink>
        )}
      </SearchForm>
      <FilterRow>
        {ACTIONS.map(name => (
          <FilterButton
            key={name}
            type="button"
            data_active={action === name}
            onClick={() => setAction(name)}
          >
            {name}
          </FilterButton>
        ))}
      </FilterRow>
      {loading && <p>Loading...</p>}
      {error && <ErrorText>{error}</ErrorText>}
      {!loading && !error && visible.length === 0 && <p>No audit entries.</p>}
      {visible.map(entry => {
        const card = entry.cardId ? cards.get(entry.cardId) : undefined;
        const label = card?.name ?? entry.cardId;
        return (
          <Entry key={`${entry.cardId}-${entry.id}`}>
            <EntryHeader>
              <strong>
                {entry.cardId ? (
                  <Link to={`/card/${encodeURIComponent(card?.hcid ?? entry.cardId)}`}>
                    {label}
                  </Link>
                ) : (
                  label
                )}
              </strong>
              <Action>{entry.action}</Action>
            </EntryHeader>
            <Meta>
              {entry.username}
              {entry.at ? ` · ${formatTime(entry.at)}` : ''}
              {entry.field ? ` · ${entry.field}` : ''}
              {entry.tag ? ` · ${entry.tag}` : ''}
            </Meta>
            <Diff>
              <DiffCol>
                <DiffLabel>Before</DiffLabel>
                <DiffBody>{describeValue(entry.changes.before)}</DiffBody>
              </DiffCol>
              <DiffCol>
                <DiffLabel>After</DiffLabel>
                <DiffBody>{describeValue(entry.changes.after)}</DiffBody>
              </DiffCol>
            </Diff>
          </Entry>
        );
      })}
    </Page>
  );
};

const pageStyles = createStyles({
  maxWidth: 900,
  margin: '0 auto',
  padding: '20px 16px',
});
const Page = createStyledDiv(pageStyles, 'Page');

const searchFormStyles = createStyles({
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  margin: '12px 0',
});
const SearchForm = ({ children, ...props }: React.ComponentProps<'form'>) => (
  <form {...handleCsProp(props, searchFormStyles)}>{children}</form>
);

const cardInputStyles = createStyles({
  flex: 1,
  padding: '6px 8px',
  border: '1px solid #ccc',
  borderRadius: 4,
  fontSize: 14,
});
const CardInput = createStyledInput(cardInputStyles, 'CardInput');

const searchButtonStyles = createStyles({
  padding: '6px 12px',
  border: '1px solid #C690FF',
  borderRadius: 4,
  background: '#C690FF',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
});
const SearchButton = createStyledButton(searchButtonStyles, 'SearchButton');

const clearLinkStyles = createStyles({
  fontSize: 13,
});
const ClearLink = createStyledLink(clearLinkStyles, 'ClearLink');

const filterRowStyles = createStyles({
  display: 'flex',
  gap: 4,
  marginBottom: 16,
  flexWrap: 'wrap',
});
const FilterRow = createStyledDiv(filterRowStyles, 'FilterRow');

const filterButtonStencil = createStencil({
  vars: {},
  base: {
    padding: '4px 12px',
    border: '1px solid #ccc',
    borderRadius: 4,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
  },
  modifiers: {
    data_active: {
      true: {
        background: '#C690FF',
        color: '#fff',
        borderColor: '#C690FF',
      },
    },
  },
});
interface FilterButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  data_active?: boolean;
}
const FilterButton = createStenciledButton<FilterButtonProps>(filterButtonStencil, 'FilterButton');

const entryStyles = createStyles({
  border: '1px solid #ddd',
  borderRadius: 4,
  padding: 12,
  marginBottom: 12,
});
const Entry = createStyledDiv(entryStyles, 'Entry');

const entryHeaderStyles = createStyles({
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
  alignItems: 'baseline',
});
const EntryHeader = createStyledDiv(entryHeaderStyles, 'EntryHeader');

const actionStyles = createStyles({
  fontSize: 12,
  color: '#555',
});
const Action = createStyledSpan(actionStyles, 'Action');

const metaStyles = createStyles({
  fontSize: 12,
  color: '#666',
  marginTop: 4,
});
const Meta = createStyledDiv(metaStyles, 'Meta');

const diffStyles = createStyles({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
  marginTop: 8,
});
const Diff = createStyledDiv(diffStyles, 'Diff');

const diffColStyles = createStyles({
  minWidth: 0,
});
const DiffCol = createStyledDiv(diffColStyles, 'DiffCol');

const diffLabelStyles = createStyles({
  fontSize: 11,
  fontWeight: 600,
  color: '#777',
  textTransform: 'uppercase',
});
const DiffLabel = createStyledDiv(diffLabelStyles, 'DiffLabel');

const diffBodyStyles = createStyles({
  margin: '4px 0 0',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontSize: 12,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
});
const DiffBody = ({ children, ...props }: React.ComponentProps<'pre'>) => (
  <pre {...handleCsProp(props, diffBodyStyles)}>{children}</pre>
);

const errorTextStyles = createStyles({
  color: '#c00',
  whiteSpace: 'pre-wrap',
});
const ErrorText = createStyledDiv(errorTextStyles, 'ErrorText');
