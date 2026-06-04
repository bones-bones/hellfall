declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
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
  export type ParsedNode = {
    content?: ParsedNode[] | string;
    type?: string;
    [key: string]: unknown;
  };
  export type ParseFunction = (source: string, state?: ParserState) => ParsedNode[];
  export type OutputFunction = (nodes: ParsedNode[], state?: ParserState) => React.ReactNode;
  export type RuleOutputFunction = (rules: Record<string, Rule>, type: string) => OutputFunction;
  export interface Rule {
    order: number;
    match: (source: string, state?: ParserState) => RegExpExecArray | null;
    parse?: (capture: RegExpExecArray, parse: ParseFunction, state?: ParserState) => ParsedNode;
    react?: (node: ParsedNode, output: OutputFunction, state?: ParserState) => React.ReactNode;
    [key: string]: unknown;
  }
  export interface ParserState {
    key?: number;
    // inline?: boolean;
    setDangerously?: boolean;
    [key: string]: Rule;
  }

  export function parserFor(rules: Record<string, Rule>): ParseFunction;

  export function reactFor(ruleOutput: RuleOutputFunction): OutputFunction;

  export function ruleOutput(rules: Record<string, Rule>, type: string): RuleOutputFunction;

  // Default export
  const simpleMarkdown: {
    parserFor: typeof parserFor;
    reactFor: typeof reactFor;
    ruleOutput: typeof ruleOutput;
  };

  export default simpleMarkdown;
}
