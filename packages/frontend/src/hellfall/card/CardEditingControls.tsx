import { useState } from 'react';
import { CardEditPanel } from './CardEditPanel.tsx';
import { useAuth } from '../../auth/AuthContext.tsx';
import { HCCard } from '@hellfall/shared/types';
import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledButton } from '../../styling/StyledElements.tsx';

export const CardEditingControls = ({
  displayCard,
  persistEnabled,
}: {
  displayCard: HCCard.Any;
  persistEnabled: boolean;
}) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);

  return (
    <>
      {user && persistEnabled && !editing && (
        <EditCardButton type="button" onClick={() => setEditing(true)}>
          Edit Card Data
        </EditCardButton>
      )}
      {editing && (
        <CardEditPanel
          card={displayCard}
          onClose={() => setEditing(false)}
          onSubmitted={() => setEditing(false)}
        />
      )}
    </>
  );
};

const editCardButtonStyles = createStyles({
  display: 'block',
  marginTop: 6,
  marginBottom: 4,
  padding: '3px 10px',
  background: '#fff',
  border: '1px solid #ccc',
  borderRadius: 2,
  fontSize: 12,
  cursor: 'pointer',
  '&:hover': { borderColor: '#888' },
});
const EditCardButton = createStyledButton(editCardButtonStyles, 'EditCardButton');
