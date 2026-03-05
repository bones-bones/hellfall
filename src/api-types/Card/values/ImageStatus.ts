export enum HCImageStatus {
  /**
   * This card's image is missing. It has not been added yet.
   * This is usually an error HC will catch quickly, but some cases involve uploading cards that simply do not yet have images available at all, such as unsigned art cards.
   */
  Missing = 'missing',
  /**
   * This face doesn't need an image.
   */
  Inapplicable = 'inapplicable',
  /**
   * This face is the front face of a multi-face card.
   */
  Front = 'front',
  /**
   * This face is the bottom of a flip card.
   */
  Flip = 'flip',
  /**
   * This face is an inset (adventure/omen).
   */
  Inset = 'inset',
  /**
   * This face is on a split side and isn't the first face.
   */
  Split = 'split',
  /**
   * This face is an aftermath face.
   */
  Aftermath = 'aftermath',
  /**
   * This card's image is a placeholder HC has generated and visibly marked as such.
   * This is most commonly seen for languages where no real images are yet available to us.
   */
  Placeholder = 'placeholder',
  /**
   * This card's image is extremely high resolution.
   * This generally comes
   */
  // ExtHighRes = 'exthighres',
  /**
   * This card's image is high resolution.
   * This generally comes from pasting over a scryfall scan or sites like mtg.design or cardconjurer.
   * Examples:
   * https://lh3.googleusercontent.com/d/1OtAM_tAgZIO1rREaOSRhRlqxLk3C7N1u
   * https://lh3.googleusercontent.com/d/1jDzsVt1paJQ6_TYRnuAkT4rkMSczh-wB
   */
  HighRes = 'highres',
  /**
   * This card's image is medium resolution.
   * This image is notably lower resolution than a highres card, but its legibility is not really impaired.
   * This is generally the resolution produced by mtgcardsmith.
   * Examples:
   * https://lh3.googleusercontent.com/d/1A-mKR9QoxNtleG3XQQSqAduvfJto6zAU
   * https://lh3.googleusercontent.com/d/1RK6rtty05-F_BXEw1mVYt-XGMc7nqgIE
   */
  MedRes = 'medres',
  /**
   * This card's image is low resolution.
   * This card's legibility is somewhat impaired.
   * Examples:
   * https://lh3.googleusercontent.com/d/1jrMwH8mEy19yfUvFuuOUdUic1gWMjqDV
   */
  LowRes = 'lowres',
  /**
   * This card's image is extremely low resolution.
   * This card's legibility is greatly impaired.
   * Examples:
   * https://lh3.googleusercontent.com/d/12UwVatjRuzHD3ZYmuf0-2GMPFhNfQYMF
   */
  ExtLowRes = 'extlowres',
  /**
   * This card's image is too nonstandard to fit into another category.
   * Examples:
   * https://lh3.googleusercontent.com/d/1TXVkEFrEN1fyQUCGPy31BaINTU668mo6
   */
  Jank = 'jank',
}
