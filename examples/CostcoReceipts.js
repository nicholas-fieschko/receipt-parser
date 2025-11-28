import { JSDOM } from "jsdom";
import { CostcoReceiptsHtml } from "./CostcoReceiptsHtml";
import { CostcoReceiptsPriceMaps } from "./CostcoReceiptsPriceMaps";

const ExampleCostcoReceiptData = {
  WithDiscount: {
    html: CostcoReceiptsHtml.WithDiscount,
    document: toDocument(CostcoReceiptsHtml.WithDiscount),
    priceMap: CostcoReceiptsPriceMaps.WithDiscount,
  },
  WithTaxes: {
    html: CostcoReceiptsHtml.WithTaxes,
    document: toDocument(CostcoReceiptsHtml.WithTaxes),
    priceMap: CostcoReceiptsPriceMaps.WithTaxes,
  },
};

function toDocument(htmlString) {
  return new JSDOM(htmlString).window.document;
}

export const ExampleCostcoReceipts = Object.entries(
  ExampleCostcoReceiptData,
).reduce(
  (receiptDocuments, [label, { document }]) => ({
    ...receiptDocuments,
    [label]: document,
  }),
  {},
);
