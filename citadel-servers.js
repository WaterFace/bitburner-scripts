export async function main(ns) {
    var bestTotal = -Infinity;
    var bestRam = ns.args[0];
    var bestN;
    var totalCost;
    var ram = 1;
    if (!ns.args[0]) {
        while (ram <= ns.getPurchasedServerMaxRam()) {
            ram *= 2;
            var cost = ns.getPurchasedServerCost(ram);
            var n = Math.floor(ns.getServerMoneyAvailable("home") / cost);
            n = Math.min(n, ns.getPurchasedServerLimit());

            if (ram * n >= bestTotal) {
                bestTotal = ram * n;
            } else {
                // the previous one was better
                bestRam = ram / 2;
                cost = ns.getPurchasedServerCost(bestRam);
                n = Math.floor(ns.getServerMoneyAvailable("home") / cost);
                bestN = Math.min(n, ns.getPurchasedServerLimit());
                ns.tprint("Best ram amount is " + bestRam);
                totalCost = bestN * cost;
                break;
            }

            // var totalCost = cost * n;
            // var totalRAM = ram * n;

            // ns.tprint(ram + "GB: Total Memory = " + totalRAM + "GB, Total Cost = $" + totalCost);
        }
    }

    while (ns.getPurchasedServerCost(bestRam) <= ns.getServerMoneyAvailable("home")) {
        if (await ns.prompt("Are you sure you want to buy " + bestN + " " + bestRam + "GB servers for " + ns.nFormat(totalCost, "$0.000a") + "?")) {
            for (var i = 0; i < bestN; i++) {
                ns.purchaseServer("citadel-"+i, bestRam);
            }
            ns.tprint("Bought " + bestN + " " + bestRam + "GB servers");
        }

    }
}