# AGENTS.md

## Project snapshot
- This repo is a small Node/ESM parser library plus bookmarklet scripts for retailer receipt pages.
- `parseCostcoReceipt.js` parses Costco receipts and also exports `receiptToCsv`; the same file self-runs in a browser when `window.document` exists.
- `parseWalmartReceipt.js` follows the same "parser + in-browser scraper" pattern, now also exporting Walmart `receiptToCsv`; it is still not re-exported from `index.js`, so import it directly.
- `examples/` holds the contract for the parsers: raw HTML fixtures (`*Html.js`), JSDOM wrappers (`*Receipts.js`), and expected parsed outputs (`*PriceMaps.js`).

## Data shapes that matter
- Costco returns a flat object keyed by item id plus metadata: `{ id?, date?, time?, total, [itemId]: { name, price, discount?, taxed?, refund? } }`.
- Costco gas receipts are a special branch detected by `div[data-bi-tc="ui:Gas Station | Receipt Close"]` and return `gas: { name: "GAS", price, perUnit, units, unitType }`.
- Walmart returns `{ id, date, total, items: [...] }`; each item is `{ name, price, perUnit, units, unitType }`.
- Costco `receiptToCsv` emits one CSV row per item with `id,total,time,date,name,computedPrice,perUnit?,units?`; Walmart `receiptToCsv` emits `id,total,date,name,price,perUnit,units,unitType` and must CSV-escape dates and names because both commonly contain commas.

## Parsing conventions already in use
- Keep selector-based parsing local to each retailer file; there is no shared abstraction layer.
- Preserve the current imperative style (`var`, loops, small helper functions) unless a change clearly needs refactoring.
- Costco discount rows are encoded as names starting with `/` and mutate the previous item (`parseCostcoReceipt.js`).
- Costco taxability is inferred from the trailing `Y` in the price column; refunds are detected from the literal row `APPROVED - REFUND`.
- Walmart dedupes repeated items with `combineDuplicateItems()` using a composite key of `name-price-units-unitType-perUnit`; edits that change item shape must keep this in sync.

## Test and fixture workflow
- Use the fixture triads in `examples/` when changing parsing logic: update HTML, then expected price map, then the parser.
- Main verification command in this checkout is:
  - `npm test -- --run`
- Tests are narrow and value-based: `parseCostcoReceipt.test.js`, `parseWalmartReceipt.test.js`, `receiptToCsv.test.js`, and `walmartReceiptToCsv.test.js` compare exact objects/CSV lines/fragments.

## Bookmarklet workflow
- `make-bookmarklet.js` reads a source file, strips `export`, writes a temp file, then invokes the `bookmarklet` CLI.
- `package.json` bookmarklet scripts are macOS-oriented because they pipe to `pbcopy`; on Windows, run `node make-bookmarklet.js parseCostcoReceipt.js` (or the Walmart file) and handle clipboard/redirection yourself.
- Because the parser files self-execute in the browser, avoid Node-only globals inside the main parsing/scraping path.

## High-value files to read first
- `parseCostcoReceipt.js`: warehouse receipt parsing, gas receipt branch, CSV generation, and Costco browser scraping flow.
- `parseWalmartReceipt.js`: item extraction, quantity parsing (`Qty` vs `Wt`), deduplication, and Walmart browser scraping flow.
- `examples/CostcoReceiptsPriceMaps.js` and `examples/WalmartReceiptsPriceMaps.js`: the most concise statement of expected output shapes.

