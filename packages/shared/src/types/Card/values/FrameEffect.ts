export enum HCFrameEffect {
  /** The cards have a legendary crown */
  Legendary = 'legendary',
  /** The miracle frame effect */
  Miracle = 'miracle',
  /** The enchantment frame effect */
  Enchantment = 'enchantment',
  /** The draft-matters frame effect */
  Draft = 'draft',
  /** The Devoid frame effect */
  Devoid = 'devoid',
  /** The Odyssey tombstone mark */
  Tombstone = 'tombstone',
  /** A colorshifted frame */
  Colorshifted = 'colorshifted',
  /** Predominantly inverted text */
  Inverted = 'inverted',
  /** The sun and moon transform marks */
  SunMoonDfc = 'sunmoondfc',
  /** The compass and land transform marks */
  CompassLandDfc = 'compasslanddfc',
  /** The Origins and planeswalker transform marks */
  OriginPwDfc = 'originpwdfc',
  /** The moon and Eldrazi transform marks */
  MoonEldraziDfc = 'mooneldrazidfc',
  /** The waxing and waning crescent moon transform marks */
  WaxingAndWaningMoonDfc = 'waxingandwaningmoondfc',
  /** The cards have More Than Meets the Eye™ marks */
  ConvertDfc = 'convertdfc',
  /** The cards have fan transforming marks */
  FanDfc = 'fandfc',
  /** The cards have the Upside Down transforming marks */
  UpsidedownDfc = 'upsidedowndfc',
  /** The cards have generic transforming marks */
  TransformDfc = 'transformdfc',
  /** The cards have generic mdfc marks */
  Mdfc = 'mdfc',
  /** A custom Showcase frame */
  Showcase = 'showcase',
  /** A custom Masterpiece frame */
  Masterpiece = 'masterpiece',
  /** An extended art frame */
  ExtendedArt = 'extendedart',
  /** Art extends into text box */
  FullArt = 'fullart',
  /** The cards have a companion frame */
  Companion = 'companion',
  /** The cards have an etched foil treatment */
  Etched = 'etched',
  /** The cards have the snowy frame effect */
  Snow = 'snow',
  /** The cards have the Lesson frame effect */
  Lesson = 'lesson',
  /** The cards have the Vehicle frame effect */
  Vehicle = 'vehicle',
  /** The cards have the Shattered Glass frame effect */
  ShatteredGlass = 'shatteredglass',
  /** The cards have Spree asterisks */
  Spree = 'spree',
}
export const TransformFrameEffects: HCFrameEffect[] = [
  HCFrameEffect.SunMoonDfc,
  HCFrameEffect.CompassLandDfc,
  HCFrameEffect.OriginPwDfc,
  HCFrameEffect.MoonEldraziDfc,
  HCFrameEffect.WaxingAndWaningMoonDfc,
  HCFrameEffect.ConvertDfc,
  HCFrameEffect.UpsidedownDfc,
  HCFrameEffect.TransformDfc,
];
