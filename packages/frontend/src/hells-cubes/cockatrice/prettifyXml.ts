// https://stackoverflow.com/questions/376373/pretty-printing-xml-with-javascript
export const prettifyXml = function (sourceXml: string) {
  const xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
  const a = [
    '<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
    ' <xsl:strip-space elements="*"/>',
    ' <xsl:template match="para[content-style][not(text())]">',
    '   <xsl:value-of select="normalize-space(.)"/>',
    ' </xsl:template>',
    ' <xsl:template match="node()|@*">',
    '   <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
    ' </xsl:template>',
    ' <xsl:output indent="yes" />',
    '</xsl:stylesheet>',
  ].join('\n');

  const xsltDoc = new DOMParser().parseFromString(a, 'application/xml');

  const xsltProcessor = new XSLTProcessor();
  xsltProcessor.importStylesheet(xsltDoc);
  const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
  const resultXml = new XMLSerializer().serializeToString(resultDoc);
  return resultXml;
};
