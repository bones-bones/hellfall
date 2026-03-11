"use strict";

/**
 * Transforms Hellscube-Database from source schema to the copy/build format.
 * Source: { data: [ { id, name, image, creator, set, legalities, ... } ] }
 * Target: { data: [ { Id, Name, Image[5], Creator, Set, Constructed, ... } ] }
 */
const COLOR_MAP = {
  W: "White",
  U: "Blue",
  B: "Black",
  R: "Red",
  G: "Green",
  C: "Colorless",
};

function colorsToStr(colors) {
  if (!Array.isArray(colors) || colors.length === 0) return "";
  return colors.map((c) => COLOR_MAP[c] || c).join(";");
}

function constructedFromLegalities(legalities) {
  if (!legalities || typeof legalities !== "object") return ["Legal"];
  const s = legalities.standard || legalities["4cb"] || "legal";
  const v = String(s).toLowerCase();
  if (v === "banned") return ["Banned"];
  return ["Legal"];
}

function arr4(first, second, third, fourth) {
  return [
    first !== undefined ? first : null,
    second !== undefined && second !== "" ? second : null,
    third !== undefined && third !== "" ? third : null,
    fourth !== undefined && fourth !== "" ? fourth : null,
  ];
}

function imageArr5(main, a2, a3, a4, a5) {
  return [
    main !== undefined && main !== "" ? main : null,
    a2 !== undefined && a2 !== "" ? a2 : null,
    a3 !== undefined && a3 !== "" ? a3 : null,
    a4 !== undefined && a4 !== "" ? a4 : null,
    a5 !== undefined && a5 !== "" ? a5 : null,
  ];
}

function transformToken(part) {
  const typeLine = part.type_line || "";
  const type = typeLine.split("—")[0].trim() || "Creature";
  return {
    Name: part.name || "",
    Image: part.image || (part.image_uris && part.image_uris.normal) || "",
    Power: part.power !== undefined ? String(part.power) : "",
    Toughness: part.toughness !== undefined ? String(part.toughness) : "",
    Type: type,
  };
}

function transformCard(card) {
  const faces = card.card_faces && card.card_faces.length > 0 ? card.card_faces : [card];
  const f0 = faces[0];
  const f1 = faces[1];

  const out = {
    Id: String(card.id ?? ""),
    Name: card.name ?? "",
    Image: imageArr5(
      card.image,
      faces[1] && faces[1].image,
      faces[2] && faces[2].image,
      faces[3] && faces[3].image,
      faces[4] && faces[4].image
    ),
    Creator: card.creator ?? "",
    Set: card.set ?? "",
    Constructed: constructedFromLegalities(card.legalities),
    "Component of": "",
    Rulings: card.rulings ?? "",
    CMC: typeof card.cmc === "number" ? card.cmc : 0,
    "Color(s)": colorsToStr(card.colors),
    Cost: arr4(
      (f0 && f0.mana_cost) ?? card.mana_cost,
      f1 && f1.mana_cost,
      faces[2] && faces[2].mana_cost,
      faces[3] && faces[3].mana_cost
    ),
    "Supertype(s)": arr4(
      Array.isArray(f0 && f0.supertypes) ? f0.supertypes.join(" ") : (card.supertypes && card.supertypes.join(" ")) || "",
      Array.isArray(f1 && f1.supertypes) ? f1.supertypes.join(" ") : "",
      faces[2] && faces[2].supertypes && faces[2].supertypes.join(" "),
      faces[3] && faces[3].supertypes && faces[3].supertypes.join(" ")
    ),
    "Card Type(s)": arr4(
      Array.isArray(f0 && f0.types) ? f0.types.join(" ") : (card.types && card.types.join(" ")) || "",
      Array.isArray(f1 && f1.types) ? f1.types.join(" ") : "",
      faces[2] && faces[2].types && faces[2].types.join(" "),
      faces[3] && faces[3].types && faces[3].types.join(" ")
    ),
    "Subtype(s)": arr4(
      Array.isArray(f0 && f0.subtypes) ? f0.subtypes.join(";") : (card.subtypes && card.subtypes.join(";")) || "",
      Array.isArray(f1 && f1.subtypes) ? f1.subtypes.join(";") : "",
      faces[2] && faces[2].subtypes && faces[2].subtypes.join(";"),
      faces[3] && faces[3].subtypes && faces[3].subtypes.join(";")
    ),
    power: arr4(
      (f0 && f0.power) ?? card.power ?? "",
      f1 && f1.power,
      faces[2] && faces[2].power,
      faces[3] && faces[3].power
    ),
    toughness: arr4(
      (f0 && f0.toughness) ?? card.toughness ?? "",
      f1 && f1.toughness,
      faces[2] && faces[2].toughness,
      faces[3] && faces[3].toughness
    ),
    Loyalty: arr4(
      (f0 && f0.loyalty) ?? card.loyalty ?? "",
      f1 && f1.loyalty,
      faces[2] && faces[2].loyalty,
      faces[3] && faces[3].loyalty
    ),
    "Text Box": arr4(
      (f0 && f0.oracle_text) ?? card.oracle_text ?? "",
      f1 && f1.oracle_text,
      faces[2] && faces[2].oracle_text,
      faces[3] && faces[3].oracle_text
    ),
    "Flavor Text": arr4(
      (f0 && f0.flavor_text) ?? card.flavor_text ?? "",
      f1 && f1.flavor_text,
      faces[2] && faces[2].flavor_text,
      faces[3] && faces[3].flavor_text
    ),
  };

  if (card.tags && Array.isArray(card.tags) && card.tags.length > 0) {
    out.Tags = card.tags.join(", ");
  } else {
    out.Tags = "";
  }

  if (card["small alt image"] !== undefined && card["small alt image"] !== "") {
    out["small alt image"] = card["small alt image"];
  }

  const tokenParts = (card.all_parts || []).filter(
    (p) => p && p.component === "token"
  );
  if (tokenParts.length > 0) {
    out.tokens = tokenParts.map(transformToken);
  }

  return out;
}

function transformHellscubeDatabase(sourceJson) {
  const parsed =
    typeof sourceJson === "string" ? JSON.parse(sourceJson) : sourceJson;
  const data = Array.isArray(parsed && parsed.data) ? parsed.data : [];
  const transformed = data.map(transformCard);
  return JSON.stringify({ data: transformed }, null, 0);
}

module.exports = { transformHellscubeDatabase };
