var logger = console.log;

async function scrapeWalmartReceipts(window, debug = false) {
  var isDebugging = window.debug || debug;
  var document = window?.document ?? window;
  var log = isDebugging ? logger : () => {};
  var receipts = [];

  // start on page 1
  let nextPageButton = document.querySelector(
    '[data-automation-id="next-pages-button"]',
  );
  let currentPage = 0;
  do {
    currentPage++;
    log("processing page ", currentPage);

    // wait for list page to load
    await waitForElm('div.mv4[data-testid^="order-"]');
    let orders = document.querySelectorAll('div.mv4[data-testid^="order-"]');

    for (let i = 0; i < orders.length; i++) {
      // document mutation means we need to refetch this list each time, but remember what we've already visited
      orders = document.querySelectorAll('div.mv4[data-testid^="order-"]');
      log(`handling order ${i + 1}`);
      console.log("orders", orders);
      var order = orders[i];
      await waitForElm('button[aria-label^="View details of Store purchase"]');
      var button = order.querySelector(
        'button[aria-label^="View details of Store purchase"]',
      );
      button.click();

      await waitForElm('div[data-testid="orderInfoCard"]');
      document
        .querySelector('button[data-automation-id="items-toggle-link"]')
        .click();
      // process receipt
      var priceMap = parseWalmartReceipt(document, log);
      receipts.push(priceMap);
      // go back to orders list page
      window.history.back();
      await waitForElm('div.mv4[data-testid^="order-"]');
    }

    // get next page button and click it
    nextPageButton = document.querySelector(
      '[data-automation-id="next-pages-button"]',
    );
    if (nextPageButton) {
      nextPageButton.click();
      await new Promise((r) => setTimeout(r, 500));
    }
  } while (nextPageButton);
}

function parseItem(rawItem, log) {
  // Name
  var name =
    rawItem.querySelector(".print-item-title a div span")?.innerHTML ??
    rawItem.querySelector(".print-item-title a").attributes["aria-label"].value;
  log("found name", name);

  // Quantity
  var quantityStr =
    rawItem.querySelector(".bill-item-quantity").innerHTML ??
    rawItem.querySelector(".bill-item-quantity").innerText;
  log("found quantity", quantityStr);
  var quantity = parseQuantity(quantityStr);

  // Price
  var priceStr =
    rawItem.querySelector('[data-testid="line-price"] span').innerHTML ??
    rawItem.querySelector('[data-testid="line-price"]').innerText;
  log("found price", priceStr);
  var price = parseFloat(priceStr.slice(1));

  var item = {
    name,
    price,
    ...quantity,
    perUnit: price / quantity.units,
  };
  log("constructed item", item);

  return item;
}

function parseQuantity(quantityStr) {
  /*
   * Example strings:
   * Qty 1
   * Wt 1.38 lb
   */
  if (quantityStr.startsWith("Qty ")) {
    return {
      unitType: "item",
      units: parseInt(quantityStr.slice(4)),
    };
  } else if (quantityStr.startsWith("Wt ")) {
    return {
      unitType: quantityStr.match(/.+\s.+\s(.+)$/)[1],
      units: parseFloat(quantityStr.slice(3)),
    };
  } else {
    throw new Error(`Unknown quantity type: ${quantityStr}`);
  }
}

export function parseWalmartReceipt(window, log = () => {}) {
  var priceMap = {};

  var receiptId = window.querySelector(".print-bill-bar-id").innerHTML.slice(4);
  priceMap.id = receiptId;
  log("found id", receiptId);

  var dateLabel = window.querySelector(".print-bill-date").innerHTML;
  priceMap.date = dateLabel.slice(0, dateLabel.length - " purchase".length);
  log("found date", priceMap.date);

  var rawItems = [
    ...window.querySelectorAll('div[data-testid="itemtile-stack"]'),
  ];
  var items = [];

  for (let j = 0; j < rawItems.length; j++) {
    log(`processing item ${j}`);
    var item = parseItem(rawItems[j], log);
    items.push(item);
  }

  log("found items", items);
  priceMap.items = combineDuplicateItems(items);

  var subTotal = window
    .querySelector(".bill-order-payment-subtotal > span")
    .innerHTML.slice(1);
  log("found subTotal", subTotal);

  var tax = [...window.querySelectorAll(".print-fees-item > span")]
    .find((el) => el.innerHTML.includes("Tax "))
    .innerHTML.slice(" Tax ".length + 1);
  log("found tax", tax);

  var total = window
    .querySelector(".bill-order-total-payment span:last-child")
    .innerHTML.slice(1);
  log("found total", total);

  priceMap.total = {
    subTotal: parseFloat(subTotal),
    tax: parseFloat(tax),
    total: parseFloat(total),
  };

  log("constructed price map", priceMap);

  return priceMap;
}

export function receiptToCsv(receiptPriceMap, debug = false) {
  var log = debug ? logger : () => {};
  var { id, date, total, items = [] } = receiptPriceMap;

  return items
    .map((item) => {
      var csvLine = [
        id,
        total.total,
        date,
        item.name,
        item.price,
        item.perUnit,
        item.units,
        item.unitType,
      ]
        .map(toCsvValue)
        .join(",");

      log("constructed csv line", csvLine);
      return csvLine;
    })
    .join("\n");
}

function toCsvValue(value) {
  var stringValue = value?.toString() ?? "";

    // Match CSV special characters: double quote, comma, or newline. If present, wrap the field in quotes and escape inner quotes.
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

function combineDuplicateItems(items) {
  var seenItems = new Map();
  var consolidatedItems = [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var { name, price, units, unitType, perUnit } = item;
    var key = `${name}-${price}-${units}-${unitType}-${perUnit}`;
    if (seenItems.has(key)) {
      var storedItem = seenItems.get(key);
      storedItem.units += 1;
      storedItem.price = storedItem.perUnit * storedItem.units;
    } else {
      seenItems.set(key, item);
      consolidatedItems.push(item);
    }
  }
  return consolidatedItems;
}

// https://stackoverflow.com/a/61511955
function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    var observer = new MutationObserver((mutations) => {
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

if (typeof window !== "undefined" && window?.document) {
  scrapeWalmartReceipts(window).then(() => logger("done"));
}
