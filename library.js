export function getServersWithRootAccess(ns, start = "home") {
    var stack = ns.scan(start);
    var searched = [];
    var pwnedServers = [];

    // depth-first search to find a list of unique
    // hostnames reachable from `start`
    while (stack.length > 0) {
        var host = stack.pop();
        searched.push(host);
        if (ns.hasRootAccess(host)) {
            if (!pwnedServers.includes(host)) { pwnedServers.push(host); }
        }
        ns.scan(host).forEach(function(next) { if (!searched.includes(next)) { stack.push(next); } });
    }

    return pwnedServers;
}

// export function getServerMinSecurity(ns, server) {
//     return Math.max(1, Math.round(ns.getServerBaseSecurityLevel(server)));
// }

export function useableRam(ns, servers, ramUsage = 1) {
    var totalRam = 0;
    for (const server of servers) {
        var ram = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
        var n = Math.floor(ram / ramUsage);
        totalRam += n * ramUsage;
    }
    return totalRam;
}