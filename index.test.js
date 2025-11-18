import { test, expect } from 'vitest';
import { ParseCostcoReceipt } from './index';
import { ExampleCostcoReceiptDom } from './costco_receipt_example';

test('can parse receipt', () => {
    const parseResults = ParseCostcoReceipt(ExampleCostcoReceiptDom, true);

    expect(parseResults).toEqual({
        91385: {
            name: 'FLAP MEAT',
            price: 36.24,
        },
        3095: {
            name: 'PAM SPRY 2PK',
            price: 7.49,
            discount: 2,
        },
        total: {
            price: 41.73,
            tax: 0,
        }
    })
})