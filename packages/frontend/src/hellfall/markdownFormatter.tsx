import { Fragment, ReactNode } from 'react';
import simpleMarkdown from 'simple-markdown';
import { stringToMana } from './stringToMana.tsx';

// Helper function to check if a character is escaped
const isEscaped = (source: string, index: number): boolean => {
  let backslashCount = 0;
  let pos = index - 1;
  while (pos >= 0 && source[pos] === '\\') {
    backslashCount++;
    pos--;
  }
  return backslashCount % 2 === 1;
};

// Create rules with escaped character support
const createRules = (invertedItalics: boolean = false) => {
  const baseRules = {
    // Strong/bold formatting (**text**)
    strong: {
      order: 1,
      match: (source: string) => {
        // Check for **
        const match = /^\*\*([\s\S]+?)\*\*(?!\*)/.exec(source);
        if (match && !isEscaped(source, match.index)) {
          return match;
        }
        return null;
      },
      parse: (capture: RegExpExecArray, parse: any, state: any) => {
        return {
          content: parse(capture[1], state),
        };
      },
      react: (node: any, output: any, state: any) => {
        return <strong key={state.key}>{output(node.content, state)}</strong>;
      },
    },

    // Underline formatting (__text__)
    under: {
      order: 1,
      match: (source: string) => {
        // Check for __
        const match = /^__([\s\S]+?)__(?!_)/.exec(source);
        if (match && !isEscaped(source, match.index)) {
          return match;
        }
        return null;
      },
      parse: (capture: RegExpExecArray, parse: any, state: any) => {
        return {
          content: parse(capture[1], state),
        };
      },
      react: (node: any, output: any, state: any) => {
        return <u key={state.key}>{output(node.content, state)}</u>;
      },
    },

    // Strikethrough formatting (~~text~~)
    del: {
      order: 3,
      match: (source: string) => {
        const match = /^~~([\s\S]+?)~~/.exec(source);
        if (match && !isEscaped(source, match.index)) {
          return match;
        }
        return null;
      },
      parse: (capture: RegExpExecArray, parse: any, state: any) => {
        return {
          content: parse(capture[1], state),
        };
      },
      react: (node: any, output: any, state: any) => {
        return (
          <del
            key={state.key}
            style={{ textDecorationThickness: '0.1em', textDecorationSkipInk: 'none' }}
          >
            {output(node.content, state)}
          </del>
        );
      },
    },

    // Plain text (fallback) - handle escaped characters
    text: {
      order: 999,
      match: (source: string) => {
        // Match until we hit a formatting character that's not escaped
        const match = /^[\s\S]+?(?=(?<!\\)(?:[*_~]|$))/.exec(source);
        return match;
      },
      parse: (capture: RegExpExecArray) => {
        // Unescape any escaped characters
        let content = capture[0];
        content = content.replace(/\\([*_~])/g, '$1');
        return {
          content: content,
        };
      },
      react: (node: any, output: any, state: any) => {
        return <span key={state.key}>{stringToMana(node.content)}</span>;
      },
    },
  };

  // Define emphasis rules based on inverted italics mode
  if (invertedItalics) {
    // In inverted italics mode:
    // - Default text is italic
    // - *text* makes text non-italic (remove italics)
    return {
      ...baseRules,
      em: {
        order: 2,
        match: (source: string) => {
          // Check for *
          let match = /^\*([\s\S]+?)\*(?!\*)/.exec(source);
          if (match && !isEscaped(source, match.index)) {
            return match;
          }
          // Check for _
          match = /^_([\s\S]+?)_(?!_)/.exec(source);
          if (match && !isEscaped(source, match.index)) {
            return match;
          }
          return null;
        },
        parse: (capture: RegExpExecArray, parse: any, state: any) => {
          return {
            content: parse(capture[1], state),
          };
        },
        react: (node: any, output: any, state: any) => {
          // In inverted italics, *text* should be non-italic
          return (
            <span key={state.key} style={{ fontStyle: 'normal' }}>
              {output(node.content, state)}
            </span>
          );
        },
      },
    };
  } else {
    // Normal mode: *text* makes text italic
    return {
      ...baseRules,
      em: {
        order: 2,
        match: (source: string) => {
          // Check for *
          let match = /^\*([\s\S]+?)\*(?!\*)/.exec(source);
          if (match && !isEscaped(source, match.index)) {
            return match;
          }
          // Check for _
          match = /^_([\s\S]+?)_(?!_)/.exec(source);
          if (match && !isEscaped(source, match.index)) {
            return match;
          }
          return null;
        },
        parse: (capture: RegExpExecArray, parse: any, state: any) => {
          return {
            content: parse(capture[1], state),
          };
        },
        react: (node: any, output: any, state: any) => {
          return <em key={state.key}>{output(node.content, state)}</em>;
        },
      },
    };
  }
};

// Helper function to parse and render a single line
const formatLine = (line: string, invertedItalics: boolean = false): ReactNode => {
  if (!line) return null;

  try {
    const rules = createRules(invertedItalics);
    const parser = simpleMarkdown.parserFor(rules);
    const reactOutput = simpleMarkdown.reactFor(simpleMarkdown.ruleOutput(rules, 'react'));

    // Parse the line into an AST
    const parsed = parser(line, { inline: true });

    if (!parsed || parsed.length === 0) {
      const content = stringToMana(line);
      if (invertedItalics) {
        return <em style={{ fontStyle: 'italic' }}>{content}</em>;
      }
      return content;
    }

    // Render the parsed nodes
    const rendered = reactOutput(parsed);

    // If inverted italics mode, wrap the entire result in <em>
    if (invertedItalics) {
      return <em style={{ fontStyle: 'italic' }}>{rendered}</em>;
    }

    return rendered;
  } catch (error) {
    console.error('Error parsing markdown line:', error);
    console.error('Problematic line:', line);
    // Fallback to plain text with mana symbols
    const content = stringToMana(line);
    if (invertedItalics) {
      return <em style={{ fontStyle: 'italic' }}>{content}</em>;
    }
    return content;
  }
};

/**
 * Format text with full markdown support across multiple lines
 * Handles **bold**, *italic*, and ~~strikethrough~~ formatting
 * Use \*, \_, \~ to escape formatting characters
 * @param text - The text to format (may contain \n for line breaks)
 * @returns React nodes with formatting applied
 */
export const formatDiscordMarkdown = (text: string): ReactNode => {
  if (!text) return null;

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
 * Use \*, \_, \~ to escape formatting characters
 * @param text - The text to format
 * @returns React nodes with formatting applied
 */
export const formatDiscordMarkdownInline = (text: string): ReactNode => {
  if (!text) return null;

  const firstLine = text.split('\\n')[0];
  return formatLine(firstLine, false);
};

/**
 * Format text with inverted italics - text is italic by default,
 * and *text* makes it normal (non-italic)
 * Use \*, \_, \~ to escape formatting characters
 * @param text - The text to format (may contain \n for line breaks)
 * @returns React nodes with inverted italics formatting
 */
export const formatDiscordMarkdownInvertedItalics = (text: string): ReactNode => {
  if (!text) return null;

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
 * Use \*, \_, \~ to escape formatting characters
 * @param text - The text to format
 * @returns React nodes with inverted italics formatting
 */
export const formatDiscordMarkdownInvertedItalicsInline = (text: string): ReactNode => {
  if (!text) return null;

  const firstLine = text.split('\\n')[0];
  return formatLine(firstLine, true);
};
