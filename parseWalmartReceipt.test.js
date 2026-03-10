import { expect, it } from "vitest";
import { parseWalmartReceipt } from "./parseWalmartReceipt";
import { ExampleWalmartReceipts } from "./examples/WalmartReceipts";
import { WalmartReceiptsPriceMaps } from "./examples/WalmartReceiptsPriceMaps";

it("can parse a basic receipt", () => {
  const parseResults = parseWalmartReceipt(ExampleWalmartReceipts.Basic);

  expect(parseResults).toEqual(WalmartReceiptsPriceMaps.Basic);
});

it("can parse a receipt with duplicate items and combines them", () => {
  const parseResults = parseWalmartReceipt(
    ExampleWalmartReceipts.WithDuplicateItems,
  );

  expect(parseResults).toEqual(WalmartReceiptsPriceMaps.WithDuplicateItems);
});
