export function parseCostcoReceipt(receipt, debug = false) {
    var log = debug ? console.log : () => {};

    var receiptTable = receipt.querySelector(".printReceipt");

    var items = receiptTable.querySelectorAll("tr");
    var rowsText = [...items].map(node => node.querySelectorAll("td"))
        .filter(items => items.length)
        .map(nodes => [...nodes].map(node => {
            var innerSpan = node.querySelector("span");
            if (innerSpan) {
                return innerSpan.innerHTML;
            }

            return node.innerHTML;
        }))

    var priceMap = { total: {} };
    var items = [];
    var reachedEndOfItems = false;
    for (var rowText of rowsText) {
        log('parsing:', rowText);
        var [_, id, name, priceCode] = rowText;

        if (priceMap[id]) {
            throw new Error('duplicate item', id);
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
                log('found discount for', discountItemIdOrName);
                if (!priceMap[name.slice(1)] && !previousItem?.name.includes(discountItemIdOrName)
                    && !previousItem?.name.toLowerCase().includes(
                        discountItemIdOrName.replace(/\s/g, "").toLowerCase())) {
                    throw new Error('unable to find item to discount for item ' + discountItemIdOrName)
                }

                previousItem.discount = price;
                log('set discount on ' + discountItemIdOrName, previousItem);
                continue;
            }

            var isPotentialPurchase = id && name && price;

            if (isPotentialPurchase) {
                priceMap[id] ??= {};
                priceMap[id].name = name;
                priceMap[id].price = price;
                var taxed = priceCode.endsWith('Y');
                if (taxed) priceMap[id].taxed = true;
                log('set name and price on ' + id, priceMap[id])
            }

            items.push(priceMap[id]);
        } else {
            if (id === "TAX") {
                var tax = toNumber(name, log);
                log('found total tax', tax);
                priceMap.total.tax = tax;
            }

            if (id?.toLowerCase() === "subtotal") {
                var subtotal = toNumber(name, log);
                log('found subtotal', subtotal)
                priceMap.total.subTotal = subtotal;
            }

            if (name?.toLowerCase() === "total") {
                priceMap.total.total = toNumber(priceCode, log);
            }
        }
    }

    return priceMap;
}

function toNumber(price, log) {
    var numericalPrice = parseFloat(price);
    log('converting price to number:', price, numericalPrice)
    return numericalPrice;
}
