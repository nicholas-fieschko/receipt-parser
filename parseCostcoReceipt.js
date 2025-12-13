var logger = console.log;

export function parseCostcoReceipt(receipt, debug = false) {
  var log = debug ? logger : () => {};

  var priceMap = {
    id: receipt.querySelector(".barcode div:last-of-type")?.innerHTML,
    time: receipt.querySelector(".time")?.innerHTML,
    total: {},
  };
  var receiptTable = receipt.querySelector(".printReceipt");
  var isGasReceipt = receipt.querySelector(
    'div[data-bi-tc="ui:Gas Station | Receipt Close"]',
  );
  if (isGasReceipt) {
    return parseCostcoGasReceipt(receipt, log);
  }

  var items = receiptTable.querySelectorAll("tr");
  var rowsText = [...items]
    .map((node) => node.querySelectorAll("td"))
    .filter((items) => items.length)
    .map((nodes) =>
      [...nodes].map((node) => {
        var innerSpan = node.querySelector("span");
        if (innerSpan) {
          return innerSpan.innerHTML;
        }

        return node.innerHTML;
      }),
    );

  var items = [];
  var reachedEndOfItems = false;
  for (var rowText of rowsText) {
    log("parsing:", rowText);
    var [firstColumn, id, name, priceCode] = rowText;

    if (priceMap[id]) {
      throw new Error("duplicate item " + id);
    }

    if (id === "SUBTOTAL") {
      reachedEndOfItems = true;
    }

    if (!reachedEndOfItems) {
      var price = toNumber(priceCode, log);

      var isDiscount = name?.startsWith("/");
      if (isDiscount) {
        var previousItem = items[items.length - 1];
        var discountItemIdOrName = name.slice(1);
        log("found discount for", discountItemIdOrName);
        if (
          !priceMap[name.slice(1).trim()] &&
          !previousItem?.name.includes(discountItemIdOrName) &&
          !previousItem?.name
            .toLowerCase()
            .includes(discountItemIdOrName.replace(/\s/g, "").toLowerCase())
        ) {
          throw new Error(
            "unable to find item to discount for item " + discountItemIdOrName,
          );
        }

        previousItem.discount = price;
        log("set discount on " + discountItemIdOrName, previousItem);
        continue;
      }

      var isPotentialPurchase = id && name && price;

      if (isPotentialPurchase) {
        priceMap[id] ??= {};
        priceMap[id].name = name;
        priceMap[id].price = price;
        var taxed = priceCode.endsWith("Y");
        if (taxed) priceMap[id].taxed = true;
        log("set name and price on " + id, priceMap[id]);
      }

      items.push(priceMap[id]);
    } else {
      if (id === "TAX") {
        var tax = toNumber(name, log);
        log("found total tax", tax);
        priceMap.total.tax = tax;
      }

      if (id?.toLowerCase() === "subtotal") {
        var subtotal = toNumber(name, log);
        log("found subtotal", subtotal);
        priceMap.total.subTotal = subtotal;
      }

      if (name?.toLowerCase() === "total") {
        priceMap.total.total = toNumber(priceCode, log);
      }

      if (rowText.length === 1 && Date.parse(firstColumn)) {
        priceMap.date = firstColumn;
        log("setting date to " + priceMap.date);
      }

      if (firstColumn === "APPROVED - REFUND") {
        items.forEach((item) => {
          item.refund = true;
        });
      }
    }
  }

  return priceMap;
}

const getLineText = (line) => line?.innerText ?? line?.innerHTML;

function parseCostcoGasReceipt(receipt, log) {
  const lines = [...receipt.querySelectorAll(".MuiTypography-bodyCopy")];
  const priceMap = { gas: { name: "GAS" }, total: {} };
  for (let i = 0; i < lines.length; i++) {
    const line = getLineText(lines[i]);
    const nextLine = getLineText(lines[i + 1]);
    log("parsing", line);

    if (line === "Invoice#") {
      priceMap.id = nextLine;
    }

    if (line === "Date:") {
      priceMap.date = nextLine;
    }

    if (line === "Time:") {
      priceMap.time = nextLine;
    }

    if (line === "Price") {
      priceMap.gas.units = toNumber(getLineText(lines[i + 2]), log);
      priceMap.gas.perUnit = toNumber(getLineText(lines[i + 3]).slice(1), log);
    }

    if (line === "Total Sale") {
      const totalGasPrice = toNumber(nextLine.slice(1), log);
      priceMap.gas.price = totalGasPrice;
      priceMap.total.total = totalGasPrice;
    }
  }

  return priceMap;
}

function toNumber(price, log) {
  var numericalPrice = parseFloat(price);
  log("converting price to number:", price, numericalPrice);
  return numericalPrice;
}

export function receiptToCsv(receiptPriceMap, debug = false) {
  var log = debug ? logger : () => {};
  var { total, date, time, id, ...items } = receiptPriceMap;
  return Object.values(items)
    .reduce((csvLines, item) => {
      var { name } = item;
      var unitsColumns = name === "GAS" ? `${item.perUnit},${item.units}` : ",";
      var itemAsCsv = `${id},${total.total},${time},${date},${name},${calculatePrice(item, log)},${unitsColumns}`;
      return [...csvLines, itemAsCsv];
    }, [])
    .join("\n");
}

function calculatePrice(item, log) {
  var { name, price, discount = 0, taxed = false, refund = false } = item;
  const taxModifier = taxed ? 1.075 : 1;
  const taxModifierDisplay = taxed ? ` * ${taxModifier}` : "";
  const refundModifier = refund ? -1 : 1;
  log(
    `calculating price for item ${name}${refund ? " (refund)" : ""}: (${price} - ${discount})${taxModifierDisplay}`,
  );
  return toTwoDecimals((price - discount) * taxModifier * refundModifier);
}

const toTwoDecimals = (num) => Number(Math.round(num + "e2") + "e-2");

// https://stackoverflow.com/a/61511955
function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

/**
 * From the Orders and Purchases page, navigates to the Warehouse purchases tab and iterates through available receipts,
 * and outputs a formatted CSV for each to the console.
 * @returns {Promise<void>}
 */
async function scrapeReceipts() {
  const isDebugging = window.debug ?? false;

  const receipts = [];
  // If already viewing receipt, just scrape what is on screen
  if (document.querySelector("#printReceipt")) {
    receipts.push(
      receiptToCsv(
        parseCostcoReceipt(window.document, isDebugging),
        isDebugging,
      ),
    );
  } else {
    // Scraping from main page
    const warehouseButton = document
      .evaluate('//div[text()="Warehouse"]', document)
      ?.iterateNext();
    if (warehouseButton) warehouseButton.click();

    // wait for view receipt buttons loaded
    await waitForElm("button[aria-describedby^='viewRecieptBtn']");

    let viewReceiptButtons = [
      ...document.querySelectorAll(
        "button[aria-describedby^='viewRecieptBtn']",
      ),
    ];
    for (let i = 0; i < viewReceiptButtons.length; i++) {
      // document mutation means we need to refetch this list each time, but remember what we've already visited
      viewReceiptButtons = [
        ...document.querySelectorAll(
          "button[aria-describedby^='viewRecieptBtn']",
        ),
      ];

      viewReceiptButtons[i].click();

      // wait for receipt to load
      await waitForElm("#printReceipt");

      receipts.push(
        receiptToCsv(
          parseCostcoReceipt(window.document, isDebugging),
          isDebugging,
        ),
      );

      // close receipt
      const closeButton = document.querySelector(
        'button[aria-label="Close"][tabindex="0"]',
      );
      closeButton.click();

      // wait for overlay to disappear
      await new Promise((r) => setTimeout(r, 500));
    }

    logger(receipts.join("\n"));
  }
}

if (typeof window !== "undefined" && window?.document) {
  scrapeReceipts().then(() => logger("done"));
}
