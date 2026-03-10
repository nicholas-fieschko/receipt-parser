import { JSDOM } from "jsdom";
import { WalmartReceiptsHtml } from "./WalmartReceiptsHtml";
import { WalmartReceiptsPriceMaps } from "./WalmartReceiptsPriceMaps";

const ExampleWalmartReceiptData = Object.keys(WalmartReceiptsHtml).reduce(
  (dataMap, receiptLabel) => ({
    ...dataMap,
    [receiptLabel]: {
      html: WalmartReceiptsHtml[receiptLabel],
      document: toDocument(WalmartReceiptsHtml[receiptLabel]),
      priceMap: WalmartReceiptsPriceMaps[receiptLabel],
    },
  }),
  {},
);

function toDocument(htmlString) {
  return new JSDOM(htmlString).window.document;
}

export const ExampleWalmartReceipts = Object.entries(
  ExampleWalmartReceiptData,
).reduce(
  (receiptDocuments, [label, { document }]) => ({
    ...receiptDocuments,
    [label]: document,
  }),
  {},
);
