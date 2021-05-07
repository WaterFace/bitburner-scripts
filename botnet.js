import { getServersWithRootAccess, useableRam } from "library.js";

export async function main(ns) {
  if (!ns.fileExists("wait-grow.ns") || !ns.fileExists("wait-hack.ns") || !ns.fileExists("wait-weak.ns")) {
    ns.tprint("This server needs to have access to the `wait-grow.ns`, `wait-hack.ns`, and `wait-weak.ns` scripts.");
    return;
  }

  // this is slightly inefficient, because the hack script uses slightly less ram
  // but this makes the math easier
  var ramPerScript = Math.max(ns.getScriptRam("wait-grow.ns"), ns.getScriptRam("wait-hack.ns"), ns.getScriptRam("wait-weak.ns"));
  // all the servers to which we have root access
  // by default, it searches from `home`
  var allServers = getServersWithRootAccess(ns);
  var availableRam = useableRam(ns, allServers, ramPerScript);
  var availableThreads = availableRam / ramPerScript;

  // for now, just `foodnstuff`
  var targets = ["foodnstuff"];

  for (const target of targets) {
    // first, weaken to zero
    var curSec = ns.getServerSecurityLevel(target);
    var minSec = ns.getServerMinSecurityLevel(target);
    // apparently this is how much `weaken` reduces
    // the security level per thread.
    // may need modification if it gets boosted 
    // later in the game or something
    const weakenPerThread = 0.05;

    var threadsNeeded = Math.ceil((curSec - minSec)/weakenPerThread);
    ns.print("Need " + threadsNeeded + " threads out of " + availableThreads + " to reduce security to minimum");
  }
}