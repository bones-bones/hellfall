export enum HCFrame {
  /** The original Magic card frame, starting from Limited Edition Alpha. */
  Original = '1993',
  /** The updated classic frame starting from Mirage block */
  Classic = '1997',
  /** The "modern" Magic card frame, introduced in Eighth Edition and Mirrodin block. */
  Modern = '2003',
  /** The holofoil-stamp Magic card frame, introduced in Magic 2015. */
  Stamp = '2015',
  /** The frame used on cards from the future */
  Future = 'future',
  /** Playtest cards */
  Playtest = 'playtest',
  /** Misc/jank frames (nonmagic, weird full art, etc.) */
  Jank = 'jank',
  /** The updated classic token frame starting from Mirage block */
  ClassicToken = 'token_1997',
  /** The "modern" Magic card frame, introduced in Eighth Edition and Mirrodin block. */
  ModernToken = 'token_2003',
  /** The holofoil-stamp Magic card frame, introduced in Magic 2015. */
  StampToken = 'token_2015',
  /** The new token frame, introduced in Magic 2020. */
  NewToken = 'token_2020',
}
export const RetroFrames: HCFrame[] = [HCFrame.Original, HCFrame.Classic, HCFrame.ClassicToken];
export const NewFrames: HCFrame[] = [HCFrame.Stamp, HCFrame.NewToken, HCFrame.StampToken];
export const CardFrames: HCFrame[] = [HCFrame.Original,HCFrame.Classic,HCFrame.Modern,HCFrame.Stamp,HCFrame.Future,HCFrame.Playtest,HCFrame.Jank];
export const TokenFrames: HCFrame[] = [HCFrame.ClassicToken,HCFrame.ModernToken,HCFrame.StampToken,HCFrame.NewToken,HCFrame.Jank];
