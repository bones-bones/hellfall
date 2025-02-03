import { HCEntry } from "../types";
import tokens from "../data/tokens.json";
export const toCockCube = ({
  name,
  set,
  cards,
}: {
  name: string;
  set: string;
  cards: HCEntry[];
}) => {
  console.log(cards.length);
  const xmlDoc = document.implementation.createDocument(
    null,
    "cockatrice_carddatabase"
  );
  xmlDoc.documentElement.setAttribute("version", "3");

  const setsElement = xmlDoc.createElement("sets");

  const setElement = xmlDoc.createElement("set");

  const nameElement = xmlDoc.createElement("name");
  const nameText = xmlDoc.createTextNode(set);
  nameElement.appendChild(nameText);
  setElement.appendChild(nameElement);

  const longNameElement = xmlDoc.createElement("longname");
  const longNameText = xmlDoc.createTextNode(name);
  longNameElement.appendChild(longNameText);
  setElement.appendChild(longNameElement);

  const settypeElement = xmlDoc.createElement("settype");
  const settypeText = xmlDoc.createTextNode("Custom");
  settypeElement.appendChild(settypeText);
  setElement.appendChild(settypeElement);

  setsElement.appendChild(setElement);

  xmlDoc.documentElement.appendChild(setsElement);

  const cardsElement = xmlDoc.createElement("cards");

  xmlDoc.documentElement.appendChild(cardsElement);

  cards.map((entry) => {
    const tempCard = xmlDoc.createElement("card");
    const name = xmlDoc.createElement("name");
    name.textContent = entry.Name;
    const setElement = xmlDoc.createElement("set");
    setElement.setAttribute("rarity", "common");
    setElement.setAttribute("picURL", entry.Image);
    setElement.textContent = set;
    const color = xmlDoc.createElement("color");
    color.textContent = (entry["Color(s)"] || "")
      .replace("Blue", "U")
      .replace("Red", "R")
      .replace("Green", "G")
      .replace("Black", "B")
      .replace("White", "W")
      .replace("Purple", "P")
      .replace(/;/g, "");
    const manacost = xmlDoc.createElement("manacost");
    manacost.textContent = entry.Cost?.filter(Boolean)
      .join(" // ")
      .replace(/\{(.)\}/g, "$1");
    const cmc = xmlDoc.createElement("cmc");
    cmc.textContent = entry.CMC?.toString() || "";
    const type = xmlDoc.createElement("type");
    type.textContent = [
      (entry["Supertype(s)"]?.[0] ?? "").replace(/;/g, " "),
      [
        (entry["Card Type(s)"]?.[0] ?? "").replace(/;/g, " "),
        (entry["Subtype(s)"]?.[0] ?? "").replace(/;/g, " "),
      ]
        .filter(Boolean)
        .join(" — "),
    ]
      .filter(Boolean)
      .join(" ");
    tempCard.appendChild(name);
    tempCard.appendChild(setElement);
    tempCard.appendChild(color);
    tempCard.appendChild(manacost);
    tempCard.appendChild(cmc);
    tempCard.appendChild(type);
    if ((entry["Card Type(s)"] || []).join("").includes("Creature")) {
      const pt = xmlDoc.createElement("pt");
      pt.textContent = `${entry.power?.[0]}/${entry.toughness?.[0]}`;
      tempCard.appendChild(pt);
    }
    const text = xmlDoc.createElement("text");
    text.textContent = (entry["Text Box"] || [])
      .filter(Boolean)
      .join("\n//\n")
      .replace(/\\n/g, "\n")
      .replace(/[{}]/g, "");
    tempCard.appendChild(text);

    cardsElement.appendChild(tempCard);
  });

  tokens.data.forEach((tokenEntry) => {
    const tokenCardEntry = xmlDoc.createElement("card");
    const name = xmlDoc.createElement("name");
    name.textContent = tokenEntry.Name.replace(/\*\d$/, "");

    const setElement = xmlDoc.createElement("set");

    setElement.setAttribute("picURL", tokenEntry.Image);

    const type = xmlDoc.createElement("type");
    type.textContent = tokenEntry.Type;
    tokenCardEntry.appendChild(name);
    tokenCardEntry.appendChild(setElement);
    tokenCardEntry.appendChild(type);
    tokenEntry["Related Cards (Read Comment)"]
      ?.split(";")
      .forEach((related) => {
        const relatedEntry = xmlDoc.createElement("reverse-related");
        relatedEntry.textContent = related;

        const count = /(.*)(\*\d)$/.exec(related);
        if (count) {
          relatedEntry.setAttribute("count", "" + count);
        }

        tokenCardEntry.appendChild(relatedEntry);
      });
    cardsElement.appendChild(tokenCardEntry);
  });

  const formattedXmlDoc = document.implementation.createDocument(
    null,
    "",
    null
  );

  // Import nodes from the original document into the new document
  formattedXmlDoc.appendChild(
    formattedXmlDoc.importNode(xmlDoc.documentElement, true)
  );

  // Serialize the new document to string with indentation
  const formattedXmlString = new XMLSerializer().serializeToString(
    formattedXmlDoc
  );

  return prettifyXml(formattedXmlString);
};

// https://stackoverflow.com/questions/376373/pretty-printing-xml-with-javascript
const prettifyXml = function (sourceXml: string) {
  const xmlDoc = new DOMParser().parseFromString(sourceXml, "application/xml");
  const xsltDoc = new DOMParser().parseFromString(
    [
      '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
      '  <xsl:strip-space elements="*"/>',
      '  <xsl:template match="para[content-style][not(text())]">',
      '    <xsl:value-of select="normalize-space(.)"/>',
      "  </xsl:template>",
      '  <xsl:template match="node()|@*">',
      '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
      "  </xsl:template>",
      '  <xsl:output indent="yes"/>',
      "</xsl:stylesheet>",
    ].join("\n"),
    "application/xml"
  );

  const xsltProcessor = new XSLTProcessor();
  xsltProcessor.importStylesheet(xsltDoc);
  const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
  const resultXml = new XMLSerializer().serializeToString(resultDoc);
  return resultXml;
};
