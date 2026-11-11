import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heading } from '@workday/canvas-kit-react';
import { FormField } from '@workday/canvas-kit-react/form-field';
import { createStyles } from '@workday/canvas-kit-styling';
import { HCImageStatus, HCKind, type SetCode } from '@hellfall/shared/types';
import { getDefaultCard, setDerivedProps } from '@hellfall/shared/utils';
import { useAuth } from '../../auth';
import { getAuthApiUrl } from '../../auth/getAuthApiUrl.ts';
import { createStyledDiv, createStyledLabel, createStyledSelect } from '../../styling';
import { CardEditPanel } from './editable-card';

function makeStubCard(kind: 'card' | 'token') {
  const id = crypto.randomUUID();
  const oracle_id = crypto.randomUUID();
  const resolvedKind = kind === 'token' ? HCKind.Token : HCKind.Card;
  const resolvedSet: SetCode = resolvedKind === HCKind.Token ? ('HCT' as SetCode) : ('' as SetCode);
  const card = getDefaultCard(
    resolvedKind,
    false,
    {
      id,
      oracle_id,
      hcid: '',
      name: '',
      set: resolvedSet,
      image: '',
      image_status: HCImageStatus.Missing,
      creators: [],
    },
    resolvedKind === HCKind.Token ? {} : { oracle_text: '' }
  );
  setDerivedProps(card, ['not-transcribed']);
  return card;
}

export const AddCardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const baseUrl = getAuthApiUrl();
  const canAdd = Boolean(user?.isAdmin || user?.isContributor) && Boolean(baseUrl);

  const [kind, setKind] = useState<'card' | 'token'>('card');
  const [hcid, setHcid] = useState('');
  const stub = useMemo(() => makeStubCard(kind), [kind]);

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
      <FormField orientation="vertical">
        <Label>Kind</Label>
        <KindSelect
          value={kind}
          onChange={e => {
            setKind(e.target.value as 'card' | 'token');
            setHcid('');
          }}
        >
          <option value="card">Card</option>
          <option value="token">Token</option>
        </KindSelect>
      </FormField>
      <CardEditPanel
        key={stub.id}
        mode="create"
        card={stub}
        hcid={hcid}
        onHcidChange={setHcid}
        hideChrome
        onClose={() => navigate('/review')}
        onSubmitted={() => navigate('/review?status=pending')}
      />
    </Page>
  );
};

const pageStyles = createStyles({
  maxWidth: 720,
  margin: '16px auto',
  padding: '0 12px 40px',
});
const Page = createStyledDiv(pageStyles, 'AddCardPage');

const labelStyles = createStyles({
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 4,
});
const Label = createStyledLabel(labelStyles, 'AddCardLabel');

const kindSelectStyles = createStyles({
  padding: '6px 8px',
  border: '1px solid #ccc',
  borderRadius: 2,
  fontSize: 14,
  marginBottom: 8,
  maxWidth: 240,
});
const KindSelect = createStyledSelect(kindSelectStyles);
