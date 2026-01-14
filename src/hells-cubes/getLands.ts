export const getLands = () => {
  return [
    ...Array(40)
      .fill(undefined)
      .map(() => ({
        cardName: "Swamp",
        sides: [{ id: "1RZtCEa2plk-4bVKBL1MdJEjJsRgI5Ht6" }],
      })),
    ...Array(40)
      .fill(undefined)
      .map(() => ({
        cardName: "Plains",
        sides: [{ id: "1YIIJG4MdOyP6v6LgeYTztMn_CFOD5e6t" }],
      })),
    ...Array(40)
      .fill(undefined)
      .map(() => ({
        cardName: "Mountain",
        sides: [{ id: "1CdSPdzbINcylm8xNemUjFoCLauyAU14X" }],
      })),
    ...Array(40)
      .fill(undefined)
      .map(() => ({
        cardName: "Island",
        sides: [{ id: "1gF3_D9K5D7GbmObO3K2PJz96hBnx-ukK" }],
      })),
    ...Array(40)
      .fill(undefined)
      .map(() => ({
        cardName: "Forest",
        sides: [{ id: "1kuDXNzDdjSGFhTQ8o53E_dVuVUFtvymg" }],
      })),
  ];
};
