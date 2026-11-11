import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledButton } from '../../../styling/StyledElements.tsx';

export const CardEditingControls = ({
  canEdit,
  onEditStart,
}: {
  canEdit: boolean;
  onEditStart: () => void;
}) => {
  if (!canEdit) return null;

  return (
    <EditCardButton type="button" onClick={onEditStart}>
      Edit Card Data
    </EditCardButton>
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
