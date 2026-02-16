declare module '*.otf' {
  const value: any; // Add better type definitions here if desired.
  export default value;
}
declare module '*.csv' {
  const value: any; // Add better type definitions here if desired.
  export default value;
}
declare module '*.json' {
  const value: { data: any };
  export default value;
}

declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<React.SVGProps<
    SVGSVGElement
  > & { title?: string }>;

  const src: string;
  export default src;
}

declare module "*.png" {
  const content: string;
  export default content;
}