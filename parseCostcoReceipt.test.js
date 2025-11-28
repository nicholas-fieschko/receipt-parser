import { test, expect } from 'vitest';
import { parseCostcoReceipt } from './parseCostcoReceipt';
import { ExampleCostcoReceipts } from './examples/CostcoReceipts';
import { CostcoReceiptsPriceMaps } from "./examples/CostcoReceiptsPriceMaps";

test('can parse receipt with a discount', () => {
    const parseResults = parseCostcoReceipt(ExampleCostcoReceipts.WithDiscount);

    expect(parseResults).toEqual(CostcoReceiptsPriceMaps.WithDiscount)
})

test('can parse receipt with taxes', () => {
    const parseResults = parseCostcoReceipt(ExampleCostcoReceipts.WithTaxes);

    expect(parseResults).toEqual(CostcoReceiptsPriceMaps.WithTaxes)
})
