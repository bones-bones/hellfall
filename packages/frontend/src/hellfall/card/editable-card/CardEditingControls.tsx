import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledButton, createStyledDiv } from '../../../styling/StyledElements.tsx';

export const CardEditingControls = ({
  canEdit,
  canEditRulings,
  onEditStart,
  onEditRulingsStart,
}: {
  canEdit: boolean;
  canEditRulings?: boolean;
  onEditStart: () => void;
  onEditRulingsStart?: () => void;
}) => {
  if (!canEdit && !canEditRulings) return null;

  return (
    <Controls>
      {canEdit && (
        <EditCardButton type="button" onClick={onEditStart}>
          Edit Card Data
        </EditCardButton>
      )}
      {!canEdit && canEditRulings && onEditRulingsStart && (
        <EditCardButton type="button" onClick={onEditRulingsStart}>
          Edit Rulings
        </EditCardButton>
      )}
    </Controls>
  );
};

const controlsStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 4,
  marginTop: 6,
  marginBottom: 4,
});
const Controls = createStyledDiv(controlsStyles, 'Controls');

const editCardButtonStyles = createStyles({
  display: 'block',
  padding: '3px 10px',
  background: '#fff',
  border: '1px solid #ccc',
  borderRadius: 2,
  fontSize: 12,
  cursor: 'pointer',
  '&:hover': { borderColor: '#888' },
});
const EditCardButton = createStyledButton(editCardButtonStyles, 'EditCardButton');
