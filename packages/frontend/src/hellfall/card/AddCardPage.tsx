import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Heading } from '@workday/canvas-kit-react';
import { FormField } from '@workday/canvas-kit-react/form-field';
import { createStyles } from '@workday/canvas-kit-styling';
import { HCImageStatus, HCKind, type SetCode } from '@hellfall/shared/types';
import {
  createCardDocumentChange,
  getDefaultCard,
  semiSplit,
  setDerivedProps,
  toSetCode,
} from '@hellfall/shared/utils';
import { useAuth } from '../../auth';
import { getAuthApiUrl } from '../../auth/getAuthApiUrl.ts';
import {
  createStyledButton,
  createStyledDiv,
  createStyledInput,
  createStyledLabel,
  createStyledLink,
  createStyledSelect,
  createStyledTextArea,
} from '../../styling';

export const AddCardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const baseUrl = getAuthApiUrl();
  const canAdd = Boolean(user?.isAdmin || user?.isContributor) && Boolean(baseUrl);

  const [kind, setKind] = useState<'card' | 'token'>('card');
  const [name, setName] = useState('');
  const [setCode, setSetCode] = useState('');
  const [creators, setCreators] = useState('');
  const [image, setImage] = useState('');
  const [hcid, setHcid] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!name.trim() || !creators.trim() || !image.trim()) return false;
    if (kind === 'card' && !setCode.trim()) return false;
    return true;
  }, [name, creators, image, setCode, kind]);

  const handleSubmit = async () => {
    if (!baseUrl || !canAdd || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const id = crypto.randomUUID();
      const oracle_id = crypto.randomUUID();
      const resolvedKind = kind === 'token' ? HCKind.Token : HCKind.Card;
      const resolvedSet: SetCode =
        resolvedKind === HCKind.Token
          ? ('HCT' as SetCode)
          : ((toSetCode(setCode.trim()) ?? setCode.trim()) as SetCode);
      const card = getDefaultCard(
        resolvedKind,
        false,
        {
          id,
          oracle_id,
          hcid: hcid.trim() || name.trim(),
          name: name.trim(),
          set: resolvedSet,
          image: image.trim(),
          image_status: HCImageStatus.HighRes,
          creators: semiSplit(creators.trim()),
        },
        resolvedKind === HCKind.Token ? {} : { oracle_text: '' }
      );
      setDerivedProps(card, ['not-transcribed']);

      const res = await fetch(`${baseUrl}/api/changesets`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: id,
          changes: [createCardDocumentChange('add', card)],
          comment: comment.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.reason || `Error ${res.status}`);
      }
      navigate('/review?status=pending');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Page>
        <Heading size="medium">Add card</Heading>
        <p>
          <Link to="/login">Log in</Link> as a database contributor to propose a new card.
        </p>
      </Page>
    );
  }

  if (!canAdd) {
    return (
      <Page>
        <Heading size="medium">Add card</Heading>
        <p>Only database contributors can propose new cards.</p>
      </Page>
    );
  }

  return (
    <Page>
      <Heading size="medium">Add card</Heading>
      <Hint>Creates a pending changeset. An approver must accept it before the card appears.</Hint>
      <Card cs={formCardStyles}>
        <Card.Body>
          <FormField orientation="vertical">
            <Label>Kind</Label>
            <KindSelect
              value={kind}
              onChange={e => setKind(e.target.value as 'card' | 'token')}
              disabled={submitting}
            >
              <option value="card">Card</option>
              <option value="token">Token</option>
            </KindSelect>
          </FormField>
          <FormField orientation="vertical">
            <Label>Name *</Label>
            <TextInput value={name} onChange={e => setName(e.target.value)} disabled={submitting} />
          </FormField>
          {kind === 'card' && (
            <FormField orientation="vertical">
              <Label>Set *</Label>
              <TextInput
                value={setCode}
                onChange={e => setSetCode(e.target.value)}
                disabled={submitting}
                placeholder="e.g. HC6"
              />
            </FormField>
          )}
          <FormField orientation="vertical">
            <Label>Creators *</Label>
            <TextInput
              value={creators}
              onChange={e => setCreators(e.target.value)}
              disabled={submitting}
              placeholder="semicolon-separated"
            />
          </FormField>
          <FormField orientation="vertical">
            <Label>Image URL *</Label>
            <TextInput
              value={image}
              onChange={e => setImage(e.target.value)}
              disabled={submitting}
            />
          </FormField>
          <FormField orientation="vertical">
            <Label>HCID (optional)</Label>
            <TextInput
              value={hcid}
              onChange={e => setHcid(e.target.value)}
              disabled={submitting}
              placeholder="defaults to name"
            />
          </FormField>
          <FormField orientation="vertical">
            <Label>Comment (optional)</Label>
            <CommentArea
              value={comment}
              onChange={e => setComment(e.target.value)}
              disabled={submitting}
              rows={3}
            />
          </FormField>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <Actions>
            <SubmitButton type="button" disabled={!canSubmit || submitting} onClick={handleSubmit}>
              {submitting ? 'Submitting…' : 'Submit for approval'}
            </SubmitButton>
            <CancelLink to="/review">Cancel</CancelLink>
          </Actions>
        </Card.Body>
      </Card>
    </Page>
  );
};

const pageStyles = createStyles({
  maxWidth: 560,
  margin: '16px auto',
  padding: '0 12px 40px',
});
const Page = createStyledDiv(pageStyles, 'AddCardPage');

const hintStyles = createStyles({
  color: '#555',
  marginBottom: 12,
  fontSize: 14,
});
const Hint = createStyledDiv(hintStyles);

const formCardStyles = createStyles({
  '& input, & select, & textarea': {
    width: '100%',
    boxSizing: 'border-box',
  },
});

const labelStyles = createStyles({
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 4,
});
const Label = createStyledLabel(labelStyles, 'AddCardLabel');

const textInputStyles = createStyles({
  padding: '6px 8px',
  border: '1px solid #ccc',
  borderRadius: 2,
  fontSize: 14,
});
const TextInput = createStyledInput(textInputStyles);
const KindSelect = createStyledSelect(textInputStyles);
const CommentArea = createStyledTextArea(textInputStyles);

const actionsStyles = createStyles({
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  marginTop: 12,
});
const Actions = createStyledDiv(actionsStyles);

const submitButtonStyles = createStyles({
  padding: '8px 16px',
  background: '#2e7d32',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  fontWeight: 600,
  cursor: 'pointer',
  '&:disabled': { opacity: 0.5, cursor: 'default' },
});
const SubmitButton = createStyledButton(submitButtonStyles);

const cancelLinkStyles = createStyles({
  fontSize: 14,
});
const CancelLink = createStyledLink(cancelLinkStyles, 'CancelLink');

const errorStyles = createStyles({
  color: '#b00020',
  marginTop: 8,
  fontSize: 14,
});
const ErrorMsg = createStyledDiv(errorStyles);
