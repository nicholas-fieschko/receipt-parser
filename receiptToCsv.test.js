import { test, expect } from "vitest";
import { CostcoReceiptsPriceMaps } from "./examples/CostcoReceiptsPriceMaps";
import { receiptToCsv } from "./parseCostcoReceipt";

test("it produces a csv string with discounts applied to prices", () => {
  const csv = receiptToCsv(CostcoReceiptsPriceMaps.WithDiscount);

  expect(csv).toContain("10/02/2025,FLAP MEAT,36.24");
  expect(csv).toContain("\n");
  expect(csv).toContain("10/02/2025,PAM SPRY 2PK,5.49");
});

test.todo("it produces a csv string with taxes applied to prices", () => {
  const csv = receiptToCsv(CostcoReceiptsPriceMaps.WithTaxes);

  throw new Error("TODO");
});
