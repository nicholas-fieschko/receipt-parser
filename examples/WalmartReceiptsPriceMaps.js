export const WalmartReceiptsPriceMaps = {
  Basic: {
    id: "4635-5974-9915-8523-5351",
    date: "Dec 12, 2025",
    total: { subTotal: 11.49, tax: 0.63, total: 12.12 },
    items: [
      {
        name: "Great Value Whole Vitamin D Milk, Gallon, 128 fl oz",
        price: 2.57,
        unitType: "item",
        perUnit: 2.57,
        units: 1,
      },
      {
        name: "Fresh Lemon, Each",
        price: 0.58,
        unitType: "item",
        perUnit: 0.58,
        units: 1,
      },
      {
        name: "LaCroix KeyLime Sparkling Water - 8pk/12 fl oz Cans, 8 / Pack (Quantity)",
        price: 4.17,
        unitType: "item",
        perUnit: 4.17,
        units: 1,
      },
      {
        name: "LaCroix Tangerine Sparkling Water, 12 Fl. Oz., 8 Count",
        price: 4.17,
        unitType: "item",
        perUnit: 4.17,
        units: 1,
      },
    ],
  },
  // WithUnits: {}, // TODO: report perUnit, units, unitType - produce, etc
  WithDuplicateItems: {
    date: "Mar 06, 2026",
    id: "8933-1473-2301-7168-2062",
    items: [
      {
        name: "Feline Pine Original 100% Natural Cat Litter, 20 lb",
        perUnit: 11.38,
        price: 11.38,
        unitType: "item",
        units: 1,
      },
      {
        name: "Electrolit Blue Raspberry 21 OZ",
        perUnit: 2.82,
        price: 2.82 * 2,
        unitType: "item",
        units: 2,
      },
      {
        name: "PR Electrolit Electrolyte Drink, Fruit Punch, 21.0 oz Bottle,",
        perUnit: 2.82,
        price: 2.82 * 2,
        unitType: "item",
        units: 2,
      },
      {
        name: "Drymate Jumbo Cat Litter Box Mat, Waterproof Urine-Proof, Absorbent, Machine Washable, Contains Mess, Soft on Paws, Kitten Supplies 29x44, Light Grey",
        perUnit: 13.36,
        price: 13.36,
        unitType: "item",
        units: 1,
      },
    ],
    total: {
      subTotal: 36.02,
      tax: 2.7,
      total: 38.72,
    },
  },
};
