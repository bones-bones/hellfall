// https://github.com/Cockatrice/Cockatrice/wiki/Custom-Cards-&-Sets
import { HCEntry } from "../types";
import tokens from "../data/tokens.json";
import { recursiveAdoption } from "./recursiveAdoption";
export const toCockCube = ({
  name,
  set,
  cards,
}: {
  name: string;
  set: string;
  cards: HCEntry[];
}) => {
  const xmlDoc = document.implementation.createDocument(
    null,
    "cockatrice_carddatabase"
  );
  xmlDoc.documentElement.setAttribute("version", "4");

  const setsElement = xmlDoc.createElement("sets");

  const setElement = xmlDoc.createElement("set");

  const nameElement = xmlDoc.createElement("name");
  nameElement.textContent = set;

  const longNameElement = xmlDoc.createElement("longname");
  longNameElement.textContent = name;

  const setTypeElement = xmlDoc.createElement("settype");
  setTypeElement.textContent = "Custom";

  const cardsElement = xmlDoc.createElement("cards");

  recursiveAdoption(xmlDoc.documentElement, [
    setsElement,
    [setElement, [nameElement, longNameElement, setTypeElement]],
    cardsElement,
  ]);

  cards.forEach((entry) => {
    recursiveAdoption(cardsElement, [
      hcCardToCockCard({ xmlDoc, set, entry, cardsElement, sideIndex: 0 }),
    ]);
  });

  tokens.data.forEach((tokenEntry) => {
    const tokenCardEntry = xmlDoc.createElement("card");
    const name = xmlDoc.createElement("name");
    name.textContent = tokenEntry.Name.replace(/\*\d$/, "");

    const setElement = xmlDoc.createElement("set");
    setElement.setAttribute("picURL", tokenEntry.Image);

    const type = xmlDoc.createElement("type");
    type.textContent = tokenEntry.Type?.split(";").join(" ");

    const tablerow = xmlDoc.createElement("tablerow");
    tablerow.textContent = getTableRowForToken(tokenEntry.Type).toString();
    const prop = xmlDoc.createElement("prop");
    recursiveAdoption(tokenCardEntry, [
      name,
      prop,
      [type],
      setElement,
      tablerow,
    ]);

    let used = false;
    tokenEntry["Related Cards (Read Comment)"]
      ?.split(";")
      .forEach((related) => {
        const relatedEntry = xmlDoc.createElement("reverse-related");
        relatedEntry.textContent = related;
        if (
          cards
            .find((entry) => related == entry.Name)
            ?.Tags?.includes("persistent-tokens")
        ) {
          relatedEntry.setAttribute("persistent", "persistent");
        }

        const count = /(.*)(\*\d)$/.exec(related);
        if (count) {
          relatedEntry.setAttribute("count", "" + count);
        }

        tokenCardEntry.appendChild(relatedEntry);
        used = true;
      });

    if (used) {
      cardsElement.appendChild(tokenCardEntry);
    }
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
  const a = [
    '<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
    ' <xsl:strip-space elements="*"/>',
    ' <xsl:template match="para[content-style][not(text())]">',
    '   <xsl:value-of select="normalize-space(.)"/>',
    " </xsl:template>",
    ' <xsl:template match="node()|@*">',
    '   <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
    " </xsl:template>",
    ' <xsl:output indent="yes" />',
    "</xsl:stylesheet>",
  ].join("\n");

  const xsltDoc = new DOMParser().parseFromString(a, "application/xml");

  const xsltProcessor = new XSLTProcessor();
  xsltProcessor.importStylesheet(xsltDoc);
  const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
  const resultXml = new XMLSerializer().serializeToString(resultDoc);
  return resultXml;
};

const hcCardToCockCard = ({
  xmlDoc,
  set,
  entry,
  cardsElement,
  sideIndex,
}: {
  xmlDoc: XMLDocument;
  set: string;
  entry: HCEntry;
  cardsElement: HTMLElement;
  sideIndex: number;
}) => {
  const tempCard = xmlDoc.createElement("card");
  const name = xmlDoc.createElement("name");
  name.textContent = entry.Image[2]
    ? entry.Name.split(" // ")[sideIndex] ||
      entry.Name + " " + entry["Card Type(s)"][1]
    : entry.Name;

  const text = xmlDoc.createElement("text");
  text.textContent = entry.Image[2]
    ? entry["Text Box"]?.[sideIndex]
        ?.replace(/\\n/g, "\n")
        .replace(/[{}]/g, "") || ""
    : (entry["Text Box"] || [])
        .filter(Boolean)
        .join("\n//\n")
        .replace(/\\n/g, "\n")
        .replace(/[{}]/g, "");

  const setElement = xmlDoc.createElement("set");
  setElement.setAttribute("rarity", "common");
  setElement.setAttribute(
    "picURL",
    entry.Image[sideIndex + 1] || entry.Image[0]!
  );
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
  const manaCost = xmlDoc.createElement("manacost");
  manaCost.textContent =
    entry.Cost?.[sideIndex]?.replace(/\{(.)\}/g, "$1") || "";

  const maintype = xmlDoc.createElement("maintype");
  maintype.textContent = entry["Card Type(s)"][sideIndex]?.includes("Creature")
    ? "Creature"
    : entry["Card Type(s)"][1]?.split(";").slice(-1)[0] || "";
  const cmc = xmlDoc.createElement("cmc");
  cmc.textContent = entry.CMC?.toString() || "";
  const type = xmlDoc.createElement("type");
  type.textContent = [
    (entry["Supertype(s)"]?.[sideIndex] ?? "").replace(/;/g, " "),
    [
      (entry["Card Type(s)"]?.[sideIndex] ?? "").replace(/;/g, " "),
      (entry["Subtype(s)"]?.[sideIndex] ?? "").replace(/;/g, " "),
    ]
      .filter(Boolean)
      .join(" — "),
  ]
    .filter(Boolean)
    .join(" ");

  let pt = undefined;
  if ((entry["Card Type(s)"][sideIndex] || "").includes("Creature")) {
    pt = xmlDoc.createElement("pt");
    pt.textContent = `${entry.power?.[sideIndex]}/${entry.toughness?.[sideIndex]}`;
  }

  let loyalty = undefined;
  if (entry["Loyalty"]) {
    loyalty = xmlDoc.createElement("loyalty");
    loyalty.textContent = entry.Loyalty?.[sideIndex];
  }

  let legality = undefined;
  // TODO: support other types
  if (entry.Constructed?.includes("Legal")) {
    legality = xmlDoc.createElement("format-standard");
    legality.textContent = "legal";
  }

  const side = xmlDoc.createElement("side");
  side.textContent = sideIndex === 0 ? "front" : "back";

  let reverse;

  // If we're not processing the first side, then we need to attach each side to the original
  if (sideIndex !== 0) {
    reverse = xmlDoc.createElement("reverse-related");
    reverse.textContent = entry.Name.split(" // ")[0];
    reverse.setAttribute("attach", "attach");
  }

  const layout = xmlDoc.createElement("layout");
  layout.textContent = sideIndex > 0 ? "transform" : getLayout(entry);

  const tablerow = xmlDoc.createElement("tablerow");
  tablerow.textContent = getTableRow(entry).toString();

  const prop = xmlDoc.createElement("prop");

  recursiveAdoption(
    tempCard,
    [
      name,
      text,
      prop,

      [
        type,
        maintype,
        manaCost,
        cmc,
        color,
        layout,
        side,
        pt,
        loyalty,
        legality,
      ].filter((e) => e !== undefined),
      setElement,
      reverse,
      tablerow,
    ].filter((e) => e !== undefined)
  );

  if (
    sideIndex == 0 &&
    entry["Card Type(s)"]?.[1] &&
    entry["Image"]?.[2] &&
    !["MR. CRIME 1981 // Felony Theft"].includes(entry.Name)
  ) {
    for (let i = 1; i < entry["Image"].filter(Boolean).length - 1; i++) {
      recursiveAdoption(cardsElement, [
        hcCardToCockCard({ xmlDoc, set, entry, cardsElement, sideIndex: i }),
      ]);
    }
  }

  return tempCard;
};

const getLayout = (card: HCEntry) => {
  if (
    (!card.Image[1] && card["Card Type(s)"]?.[1]) ||
    ["Battle", "Plane", "Phenomenon"].find((e) =>
      card["Card Type(s)"]?.[0]?.split(";").includes(e)
    )
  ) {
    return "split";
  }

  return "normal";
};

const getTableRow = (card: HCEntry) => {
  if (
    card["Card Type(s)"]?.find(
      (entry) =>
        entry?.split(";").includes("Instant") ||
        entry?.split(";").includes("Sorcery")
    )
  ) {
    return 3;
  }

  if (
    card["Card Type(s)"]?.find((entry) =>
      entry?.split(";").includes("Creature")
    )
  ) {
    return 2;
  }

  if (
    card["Card Type(s)"]?.find((entry) => entry?.split(";").includes("Land"))
  ) {
    return 0;
  }
  return 1;
};

const getTableRowForToken = (type: string) => {
  if (
    type.split(";").includes("Instant") ||
    type.split(";").includes("Sorcery")
  ) {
    return 3;
  }

  if (type.split(";").includes("Creature")) {
    return 2;
  }

  if (type.split(";").includes("Land")) {
    return 0;
  }
  return 1;
};
