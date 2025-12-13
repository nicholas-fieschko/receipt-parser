import { expect, it } from "vitest";
import { CostcoReceiptsPriceMaps } from "./examples/CostcoReceiptsPriceMaps";
import { receiptToCsv } from "./parseCostcoReceipt";

it("produces a csv string with discounts applied to prices", () => {
  const csv = receiptToCsv(CostcoReceiptsPriceMaps.WithDiscount);

  expect(csv).toContain("10/02/2025,FLAP MEAT,36.24");
  expect(csv).toContain("\n");
  expect(csv).toContain("10/02/2025,PAM SPRY 2PK,5.49");
});

it("produces a csv string with taxes applied to prices", () => {
  const csv = receiptToCsv(CostcoReceiptsPriceMaps.WithTaxes);

  const expectedLines = [
    "11/24/2025,WHOLE MILK,2.57",
    "11/24/2025,ROTISSERIE,5.36",
    "11/24/2025,KS SPARKLING,12.89",
    "11/24/2025,HVY CREAM QT,4.19",
    "11/24/2025,SPCY STRIPS,15.99",
    "11/24/2025,10LB BAKERS,4.49",
    "11/24/2025,LACROIX HOLI,8.37",
    "11/24/2025,CHERRY POM,8.79",
    "11/24/2025,KS PEPPRCORN,7.49",
    "11/24/2025,KS STRAWPRES,8.39",
    "11/24/2025,YELLOW ONION,3.29",
    "11/24/2025,KS BACON,16.99",
  ];

  for (const line of expectedLines) {
    expect(csv).toContain(line);
  }
});

it("produces a csv string with the total, receipt ID, and timestamp on each line", () => {
  const csv = receiptToCsv(CostcoReceiptsPriceMaps.WithId);

  const expectedLine =
    "21129420302422512051854,45.09,18:54,12/05/2025,MICROGREENS,7.99,,";

  expect(csv).toContain(expectedLine);
});

it("produces a csv string for gas station purchases with the total, price per gallon, and number of gallons", () => {
  const csv = receiptToCsv(CostcoReceiptsPriceMaps.Gas);

  const expectedLine = "39411,10.82,18:31,12/05/25,GAS,10.82,2.699,4.009";

  expect(csv).toContain(expectedLine);
});
