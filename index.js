export function ParseCostcoReceipt(receipt, debug = false) {
    var log = debug ? console.log : () => {};

    var receiptTable = receipt.querySelector(".printReceipt");

    var items = receiptTable.querySelectorAll("tr");
    var rowsText = [...items].map(node => node.querySelectorAll("td"))
        .filter(items => items.length)
        .map(nodes => [...nodes].map(node => {
            const innerSpan = node.querySelector("span");
            if (innerSpan) {
                return innerSpan.innerHTML;
            }

            return node.innerHTML;
        }))

    var priceMap = { total: {} };
    var reachedEndOfItems = false;
    for (var rowText of rowsText) {
        log('parsing:', rowText);
        var [_, id, name, price] = rowText;

        if (priceMap[id]) {
            throw new Error('duplicate item', id);
        }

        if (id === "SUBTOTAL") {
            reachedEndOfItems = true;
        }

        if (!reachedEndOfItems) {
            price = convertToNumber(price, log);

            var isDiscount = name?.startsWith("/");
            if (isDiscount) {
                var discountedItemId = name.slice(1);
                log('found discount for', discountedItemId);
                if (!priceMap[discountedItemId]) {
                    throw new Error('unable to find item to discount for code', code)
                }

                priceMap[discountedItemId].discount = price;
                log('set discount on ' + discountedItemId, priceMap[discountedItemId]);
                continue;
            }

            var isPotentialPurchase = id && name && price;

            if (isPotentialPurchase) {
                priceMap[id] ??= {};
                priceMap[id].name = name;
                priceMap[id].price = price;
                log('set name and price on ' + id, priceMap[id])
            }
        } else {
            if (id === "TAX") {
                priceMap.total.tax = convertToNumber(name, log);
            }

            if (name?.toLowerCase() === "total") {
                priceMap.total.price = convertToNumber(price, log);
            }
        }
    }

    return priceMap;
}


function convertToNumber(price, log) {
    var numericalPrice = parseFloat(price);
    log('converting price to number:', price, numericalPrice)
    return numericalPrice;
}