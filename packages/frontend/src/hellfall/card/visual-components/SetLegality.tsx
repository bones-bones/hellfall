import { StatusIndicator } from '@workday/canvas-kit-preview-react/status-indicator';

export const SetLegality = ({ legality }: { legality: string }) => {
  switch (legality) {
    case 'banned': {
      return (
        <StatusIndicator variant="critical">
          <StatusIndicator.Label>Banned</StatusIndicator.Label>
        </StatusIndicator>
      );
    }
    case 'legal': {
      return (
        <StatusIndicator variant="positive">
          <StatusIndicator.Label>Legal</StatusIndicator.Label>
        </StatusIndicator>
      );
    }
    default: {
      return (
        <StatusIndicator>
          <StatusIndicator.Label>Not Legal</StatusIndicator.Label>
        </StatusIndicator>
      );
    }
  }
};
