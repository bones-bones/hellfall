import { Fragment, ReactNode } from 'react';
import simpleMarkdown from 'simple-markdown';
import { stringToMana } from './stringToMana';

// Define the rules for our custom markdown parser
const rules = {
  // Strong/bold formatting (**text** or __text__)
  strong: {
    order: 1,
    match: (source: string) => /^\*\*([\s\S]+?)\*\*(?!\*)/.exec(source) ||
                             /^__([\s\S]+?)__(?!_)/.exec(source),
    parse: (capture: RegExpExecArray, parse: any, state: any) => {
      return {
        content: parse(capture[1], state)
      };
    },
    react: (node: any, output: any, state: any) => {
      return <strong key={state.key}>{output(node.content, state)}</strong>;
    }
  },

  // Emphasis/italic formatting (*text* or _text_)
  em: {
    order: 2,
    match: (source: string) => /^\*([\s\S]+?)\*(?!\*)/.exec(source) ||
                             /^_([\s\S]+?)_(?!_)/.exec(source),
    parse: (capture: RegExpExecArray, parse: any, state: any) => {
      return {
        content: parse(capture[1], state)
      };
    },
    react: (node: any, output: any, state: any) => {
      return <em key={state.key}>{output(node.content, state)}</em>;
    }
  },

  // Strikethrough formatting (~~text~~)
  del: {
    order: 3,
    match: (source: string) => /^~~([\s\S]+?)~~/.exec(source),
    parse: (capture: RegExpExecArray, parse: any, state: any) => {
      return {
        content: parse(capture[1], state)
      };
    },
    react: (node: any, output: any, state: any) => {
      return <del key={state.key}>{output(node.content, state)}</del>;
    }
  },

  // Plain text (fallback)
  text: {
    order: 999,
    match: (source: string) => /^[\s\S]+?(?=[*_~]|$)/.exec(source),
    parse: (capture: RegExpExecArray) => {
      return {
        content: capture[0]
      };
    },
    react: (node: any, output: any, state: any) => {
      // Apply stringToMana to handle mana symbols in text
      return <span key={state.key}>{stringToMana(node.content)}</span>;
    }
  }
};

// Create the parser and output functions
const parser = simpleMarkdown.parserFor(rules);
const reactOutput = simpleMarkdown.reactFor(simpleMarkdown.ruleOutput(rules, 'react'));

// Helper function to parse and render a single line
const formatLine = (line: string, invertedItalics: boolean = false): ReactNode => {
  if (!line || line === ';') return null;

  try {
    // Parse the line into an AST
    const parsed = parser(line, { inline: true });
    
    if (!parsed || parsed.length === 0) {
      return stringToMana(line);
    }

    // Render the parsed nodes
    const rendered = reactOutput(parsed);
    
    // If inverted italics mode, wrap the entire result in <em>
    if (invertedItalics) {
      return <em>{rendered}</em>;
    }
    
    return rendered;
  } catch (error) {
    console.error('Error parsing markdown line:', error);
    console.error('Problematic line:', line);
    // Fallback to plain text with mana symbols
    return stringToMana(line);
  }
};

/**
 * Format text with full markdown support across multiple lines
 * Handles **bold**, *italic*, and ~~strikethrough~~ formatting
 * @param text - The text to format (may contain \n for line breaks)
 * @returns React nodes with formatting applied
 */
export const formatDiscordMarkdown = (text: string): ReactNode => {
  if (!text || text === ';') return null;

  const lines = text.split('\\n');
  
  return lines.map((line, index) => {
    const formattedLine = formatLine(line, false);
    return (
      <Fragment key={`line-${index}`}>
        {index > 0 && <br />}
        {formattedLine}
      </Fragment>
    );
  });
};

/**
 * Format text as inline (no line breaks) with full markdown support
 * @param text - The text to format
 * @returns React nodes with formatting applied
 */
export const formatDiscordMarkdownInline = (text: string): ReactNode => {
  if (!text || text === ';') return null;
  
  const firstLine = text.split('\\n')[0];
  return formatLine(firstLine, false);
};

/**
 * Format text with inverted italics - text is italic by default,
 * and *text* makes it normal (non-italic)
 * @param text - The text to format (may contain \n for line breaks)
 * @returns React nodes with inverted italics formatting
 */
export const formatDiscordMarkdownInvertedItalics = (text: string): ReactNode => {
  if (!text || text === ';') return null;

  const lines = text.split('\\n');
  
  return lines.map((line, index) => {
    const formattedLine = formatLine(line, true);
    return (
      <Fragment key={`line-${index}`}>
        {index > 0 && <br />}
        {formattedLine}
      </Fragment>
    );
  });
};

/**
 * Format text as inline with inverted italics (single line)
 * @param text - The text to format
 * @returns React nodes with inverted italics formatting
 */
export const formatDiscordMarkdownInvertedItalicsInline = (text: string): ReactNode => {
  if (!text || text === ';') return null;

  const firstLine = text.split('\\n')[0];
  return formatLine(firstLine, true);
};