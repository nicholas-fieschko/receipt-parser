import { it, expect } from "vitest";
import { parseCostcoReceipt } from "./parseCostcoReceipt";
import { ExampleCostcoReceipts } from "./examples/CostcoReceipts";
import { CostcoReceiptsPriceMaps } from "./examples/CostcoReceiptsPriceMaps";

it("can parse receipt with a discount", () => {
  const { id, time, ...parseResults } = parseCostcoReceipt(
    ExampleCostcoReceipts.WithDiscount,
  );

  expect(parseResults).toEqual(CostcoReceiptsPriceMaps.WithDiscount);
});

it("can parse receipt with taxes", () => {
  const { id, time, ...parseResults } = parseCostcoReceipt(
    ExampleCostcoReceipts.WithTaxes,
  );

  expect(parseResults).toEqual(CostcoReceiptsPriceMaps.WithTaxes);
});

it("sets the time and id properties", () => {
  const parseResults = parseCostcoReceipt(ExampleCostcoReceipts.WithId);

  expect(parseResults).toEqual(CostcoReceiptsPriceMaps.WithId);
});

it("can parse a gas station receipt", () => {
  const parseResults = parseCostcoReceipt(ExampleCostcoReceipts.Gas);

  expect(parseResults).toEqual(CostcoReceiptsPriceMaps.Gas);
});
