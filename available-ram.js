import { getServersWithRootAccess, useableRam } from "library.ns";

export async function main(ns) {
    var servers = getServersWithRootAccess(ns);
    var availableRam = 0;
    
    availableRam = useableRam(ns, servers);
    ns.tprint("Unused RAM: " + availableRam);
}