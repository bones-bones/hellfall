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

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  const src: string;
  export default src;
}

declare module '*.png' {
  const content: string;
  export default content;
}
declare module 'simple-markdown' {
  export interface ParserState {
    key?: number;
    inline?: boolean;
    [key: string]: any;
  }

  export interface Rule {
    order: number;
    match: (source: string, state?: ParserState) => RegExpExecArray | null;
    parse?: (capture: RegExpExecArray, parse: any, state?: ParserState) => any;
    react?: (node: any, output: any, state?: ParserState) => React.ReactNode;
    [key: string]: any;
  }

  export function parserFor(rules: Record<string, Rule>): (source: string, state?: ParserState) => any[];
  export function reactFor(ruleOutput: (rules: Record<string, Rule>, type: string) => any): (nodes: any[], state?: ParserState) => React.ReactNode;
  export function ruleOutput(rules: Record<string, Rule>, type: string): (rules: Record<string, Rule>, type: string) => any;
  
  // Default export
  const simpleMarkdown: {
    parserFor: typeof parserFor;
    reactFor: typeof reactFor;
    ruleOutput: typeof ruleOutput;
  };
  
  export default simpleMarkdown;
}