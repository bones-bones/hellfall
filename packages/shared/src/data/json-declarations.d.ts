declare module '*.json' {
  const value: any;
  export default value;
}

declare module './Hellscube-Database.json' {
  import type { HCCard } from '../types';
  const value: { data: HCCard.Any[] };
  export default value;
}

declare module './lands.json' {
  import type { HCCard } from '../types';
  const value: { data: HCCard.Any[] };
  export default value;
}

declare module './tokens.json' {
  import type { HCCard } from '../types';
  const value: { data: HCCard.Any[] };
  export default value;
}

declare module './pips.json' {
  import type { HCCardSymbol } from '../types';
  const value: { data: HCCardSymbol[] };
  export default value;
}

declare module './sets.json' {
  import type { HCSet } from '../types';
  const value: { data: HCSet[] };
  export default value;
}

declare module './creators.json' {
  const value: { data: string[] };
  export default value;
}

declare module './oracle-names.json' {
  const value: { data: string[] };
  export default value;
}

declare module './tags.json' {
  const value: { data: string[] };
  export default value;
}

declare module './types.json' {
  const value: { data: string[] };
  export default value;
}
