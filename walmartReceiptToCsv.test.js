import { expect, it } from "vitest";
import { WalmartReceiptsPriceMaps } from "./examples/WalmartReceiptsPriceMaps";
import { receiptToCsv } from "./parseWalmartReceipt";

it("produces one CSV line per Walmart item with quoted date and item names", () => {
  const csv = receiptToCsv(WalmartReceiptsPriceMaps.Basic);

  const expectedLines = [
    '4635-5974-9915-8523-5351,12.12,"Dec 12, 2025","Great Value Whole Vitamin D Milk, Gallon, 128 fl oz",2.57,2.57,1,item',
    '4635-5974-9915-8523-5351,12.12,"Dec 12, 2025","Fresh Lemon, Each",0.58,0.58,1,item',
    '4635-5974-9915-8523-5351,12.12,"Dec 12, 2025","LaCroix KeyLime Sparkling Water - 8pk/12 fl oz Cans, 8 / Pack (Quantity)",4.17,4.17,1,item',
    '4635-5974-9915-8523-5351,12.12,"Dec 12, 2025","LaCroix Tangerine Sparkling Water, 12 Fl. Oz., 8 Count",4.17,4.17,1,item',
  ];

  expect(csv.split("\n")).toEqual(expectedLines);
});

it("uses consolidated Walmart item totals when duplicate items were combined", () => {
  const csv = receiptToCsv(WalmartReceiptsPriceMaps.WithDuplicateItems);

  const expectedLines = [
    '8933-1473-2301-7168-2062,38.72,"Mar 06, 2026","Feline Pine Original 100% Natural Cat Litter, 20 lb",11.38,11.38,1,item',
    '8933-1473-2301-7168-2062,38.72,"Mar 06, 2026",Electrolit Blue Raspberry 21 OZ,5.64,2.82,2,item',
    '8933-1473-2301-7168-2062,38.72,"Mar 06, 2026","PR Electrolit Electrolyte Drink, Fruit Punch, 21.0 oz Bottle,",5.64,2.82,2,item',
    '8933-1473-2301-7168-2062,38.72,"Mar 06, 2026","Drymate Jumbo Cat Litter Box Mat, Waterproof Urine-Proof, Absorbent, Machine Washable, Contains Mess, Soft on Paws, Kitten Supplies 29x44, Light Grey",13.36,13.36,1,item',
  ];

  expect(csv.split("\n")).toEqual(expectedLines);
});
