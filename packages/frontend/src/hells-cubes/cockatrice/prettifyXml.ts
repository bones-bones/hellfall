import format from 'xml-formatter';

export const prettifyXml = (sourceXml: string): string => {
  return format(sourceXml, {
    indentation: '  ',
    // filter: (node) => node.type !== 'comment', // Skip comments if desired
    collapseContent: true,
    lineSeparator: '\n',
  });
};
