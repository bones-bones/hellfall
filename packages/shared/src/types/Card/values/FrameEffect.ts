export enum HCFrameEffect {
  /** The sun and moon transform marks */
  SunMoonDfc = 'sunmoondfc',
  /** The compass and land transform marks */
  CompassLandDfc = 'compasslanddfc',
  /** The Origins and planeswalker transform marks */
  OriginPwDfc = 'originpwdfc',
  /** The moon and Eldrazi transform marks */
  MoonEldraziDfc = 'mooneldrazidfc',
  /** The cards have fan transforming marks */
  FanDfc = 'fandfc',
  /** The cards have type transforming marks */
  TypeDfc = 'typedfc',
  /** The cards have generic transforming marks */
  TransformDfc = 'transformdfc',
  /** The cards have generic mdfc marks */
  Mdfc = 'mdfc',
  /** The cards have generic specialize marks */
  Specialize = 'specialize',
  /** The cards have meld marks */
  Meld = 'meld',
  /** The cards have a legendary crown */
  Legendary = 'legendary',
  /** The cards have a companion frame */
  Companion = 'companion',
  /** The cards have the snowy frame effect */
  Snow = 'snow',
  /** The enchantment frame effect */
  Enchantment = 'enchantment',
  /** The cards have the Lesson frame effect */
  Lesson = 'lesson',
  /** The cards have the Vehicle frame effect */
  Vehicle = 'vehicle',
  /** The miracle frame effect */
  Miracle = 'miracle',
  /** The draft-matters frame effect */
  Draft = 'draft',
  /** The Devoid frame effect */
  Devoid = 'devoid',
  /** The cards have Spree asterisks */
  Spree = 'spree',
  /** The Odyssey tombstone mark */
  Tombstone = 'tombstone',
  /** A colorshifted frame */
  Colorshifted = 'colorshifted',
  /** Predominantly inverted text */
  Inverted = 'inverted',
  /** A custom Showcase frame (See https://mtg.wiki/page/Showcase/Showcase_by_variant for examples) */
  Showcase = 'showcase',
  /** A custom Masterpiece frame */
  Masterpiece = 'masterpiece',
  /** Art extends into text box */
  FullArt = 'fullart',
  /** An extended art frame */
  ExtendedArt = 'extendedart',
  /** The cards have a vertical art box (e.g. sagas, cases, etc.) */
  VerticalArt = 'verticalart',
  /** The cards have no art box */
  NoArt = 'noart',
  /** The cards have an etched foil treatment */
  Etched = 'etched',
  /** The card is in a slab */
  Slab = 'slab',
  /** The card has an arena frame */
  Arena = 'arena',
  /** The waxing and waning crescent moon transform marks */
  WaxingAndWaningMoonDfc = 'waxingandwaningmoondfc',
  /** The cards have More Than Meets the Eye™ marks */
  ConvertDfc = 'convertdfc',
  /** The cards have the Upside Down transforming marks */
  UpsidedownDfc = 'upsidedowndfc',
  /** The cards have the Shattered Glass frame effect */
  ShatteredGlass = 'shatteredglass',
}
export const TransformFrameEffects: HCFrameEffect[] = [
  HCFrameEffect.SunMoonDfc,
  HCFrameEffect.CompassLandDfc,
  HCFrameEffect.OriginPwDfc,
  HCFrameEffect.MoonEldraziDfc,
  HCFrameEffect.WaxingAndWaningMoonDfc,
  HCFrameEffect.ConvertDfc,
  HCFrameEffect.UpsidedownDfc,
  HCFrameEffect.TypeDfc,
  HCFrameEffect.TransformDfc,
  HCFrameEffect.FanDfc,
  HCFrameEffect.Mdfc,
  HCFrameEffect.Specialize,
];
