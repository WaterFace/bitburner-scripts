import { getServersWithRootAccess, useableRam } from "library.js";

export async function main(ns) {
  if (!ns.fileExists("wait-grow.js") || !ns.fileExists("wait-hack.js") || !ns.fileExists("wait-weak.js")) {
    ns.tprint("This server needs to have access to the `wait-grow.js`, `wait-hack.js`, and `wait-weak.js` scripts.");
    return;
  }

  // this is slightly inefficient, because the hack script uses slightly less ram
  // but this makes the math easier
  var ramPerScript = Math.max(ns.getScriptRam("wait-grow.js"), ns.getScriptRam("wait-hack.js"), ns.getScriptRam("wait-weak.js"));
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
    ns.tprint("Need " + threadsNeeded + " threads out of " + availableThreads + " to reduce security to minimum");
  }
}