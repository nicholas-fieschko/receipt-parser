import { JSDOM } from "jsdom";
import { CostcoReceiptsHtml } from "./CostcoReceiptsHtml";
import { CostcoReceiptsPriceMaps } from "./CostcoReceiptsPriceMaps";

const ExampleCostcoReceiptData = Object.keys(CostcoReceiptsHtml).reduce(
  (dataMap, receiptLabel) => ({
    ...dataMap,
    [receiptLabel]: {
      html: CostcoReceiptsHtml[receiptLabel],
      document: toDocument(CostcoReceiptsHtml[receiptLabel]),
      priceMap: CostcoReceiptsPriceMaps[receiptLabel],
    },
  }),
  {},
);

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
