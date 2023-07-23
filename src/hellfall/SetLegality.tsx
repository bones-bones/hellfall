import {
  StatusIndicator,
  StatusIndicatorType,
} from "@workday/canvas-kit-react/status-indicator";

export const SetLegality = ({ banned }: { banned: boolean }) => {
  return banned ? (
    <StatusIndicator label={"Banned"} type={StatusIndicatorType.Red} />
  ) : (
    <StatusIndicator label={"Legal"} type={StatusIndicatorType.Green} />
  );
};
