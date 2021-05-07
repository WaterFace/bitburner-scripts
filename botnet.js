import { getServersWithRootAccess, useableRam, useableThreads } from "library.js";

export async function main(ns) {
  const growScript = "wait-grow.js";
  const hackScript = "wait-hack.js";
  const weakScript = "wait-weak.js";

  if (!ns.fileExists(growScript) || !ns.fileExists(hackScript) || !ns.fileExists(weakScript)) {
    ns.print("This server needs to have access to the `"+ growScript +"`, `"+ hackScript +"`, and `"+ weakScript +"` scripts.");
    return;
  }

  // this is slightly inefficient, because the hack script uses slightly less ram
  // but this makes the math easier
  var ramPerScript = Math.max(ns.getScriptRam(growScript), ns.getScriptRam(hackScript), ns.getScriptRam(weakScript));
  // all the servers to which we have root access
  // by default, it searches from `home`
  var allServers = getServersWithRootAccess(ns);
  // var availableRam = useableRam(ns, allServers, ramPerScript);
  var availableThreads = useableThreads(ns, allServers, ramPerScript);

  for (const server of allServers) {
    ns.scp([growScript, hackScript, weakScript], "home", server);
  }

  // for now, just `foodnstuff`
  var target = "foodnstuff";


    // first, weaken to zero
    var curSec = ns.getServerSecurityLevel(target);
    var minSec = ns.getServerMinSecurityLevel(target);
    // apparently this is how much `weaken` reduces
    // the security level per thread.
    // may need modification if it gets boosted 
    // later in the game or something
    const weakenPerThread = 0.05;
    var threadsNeeded = Math.ceil((curSec - minSec)/weakenPerThread);
    if (threadsNeeded > 0) {
      ns.print(target + ":");
      ns.print("Need " + threadsNeeded + " threads out of " + availableThreads + " to reduce security to minimum");
      await runBotScript(ns, weakScript, target, 0, allServers, threadsNeeded, ramPerScript);
    }
    var timeToWeaken = threadsNeeded > 0 ? ns.getWeakenTime(target) : 0;
    await ns.sleep(timeToWeaken * 1000);

    // now the target has the minimum security level

    while (true){
      // availableRam = useableRam(ns, allServers, ramPerScript);
      availableThreads = useableThreads(ns, allServers, ramPerScript);

      const securityPerGrow = 0.004;
      var amountToGrow = ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target);
      var threadsToGrow = amountToGrow>=1?Math.ceil(ns.growthAnalyze(target, amountToGrow)) : 0;
      threadsToGrow = Math.min(threadsToGrow, availableThreads);
      ns.print("Need " + threadsToGrow + " threads to grow " + target + " to maximum");
      var securityFromGrowth = threadsToGrow * securityPerGrow;
      var threadsToCounterGrowth = Math.ceil(securityFromGrowth / weakenPerThread);
      var timeToGrow = ns.getGrowTime(target);

      availableThreads = useableThreads(ns, allServers, ramPerScript);

      const securityPerHack = 0.002;
      var moneyToHack = ns.getServerMoneyAvailable(target) * 0.9;
      var threadsToHack = Math.floor(ns.hackAnalyzeThreads(target, moneyToHack));
      threadsToHack = Math.min(threadsToHack, availableThreads);
      var securityFromHack = threadsToHack * securityPerHack;
      var threadsToCounterHack = Math.ceil(securityFromHack / weakenPerThread);
      var timeToHack = ns.getHackTime(target);


      if (timeToGrow > timeToWeaken) {
        // ns.print("Grow finishes after " + timeToGrow + "s, Weaken finishes after " + ((timeToGrow - timeToWeaken) * 1.1+timeToWeaken)+"s");
        await runBotScript(ns, growScript, target, 0, allServers, threadsToGrow, ramPerScript);
        await runBotScript(ns, weakScript, target, (timeToGrow - timeToWeaken) * 1000 * 1.1, allServers, threadsToCounterGrowth, ramPerScript);
      } else {
        // ns.print("Grow finishes after " + ((timeToWeaken - timeToGrow)  * 0.9+timeToGrow) + "s, Weaken finishes after " + timeToWeaken + "s");
        await runBotScript(ns, weakScript, target, 0, allServers, threadsToCounterGrowth, ramPerScript);      
        await runBotScript(ns, growScript, target, (timeToWeaken - timeToGrow) * 1000 * 0.9, allServers, threadsToGrow, ramPerScript);
      }

      await ns.sleep(Math.max(threadsToGrow>0?timeToGrow:0, threadsToCounterGrowth>0?timeToWeaken:0) * 1000);

      if (timeToHack > timeToWeaken) {
        // ns.print("Hack finishes after " + timeToHack + "s, Weaken finishes after " + ((timeToHack - timeToWeaken) * 1.1+timeToWeaken)+"s");
        await runBotScript(ns, hackScript, target, 0, allServers, threadsToHack, ramPerScript);
        await runBotScript(ns, weakScript, target, (timeToHack - timeToWeaken) * 1.1, allServers, threadsToCounterHack, ramPerScript);
      } else {
        // ns.print("Hack finishes after " + ((timeToWeaken - timeToHack)  * 0.9+timeToHack) + "s, Weaken finishes after " + timeToWeaken + "s");
        await runBotScript(ns, weakScript, target, 0, allServers, threadsToCounterHack, ramPerScript);      
        await runBotScript(ns, hackScript, target, (timeToWeaken - timeToHack) * 1000 * 0.9, allServers, threadsToHack, ramPerScript);
      }

      await ns.sleep(Math.max(threadsToHack>0?timeToHack:0, threadsToCounterHack>0?timeToWeaken:0) * 1000);
    }
  }

  async function runBotScript(ns, script, target, delay, servers, threads, ramPerScript) {
    var toRun = threads;

    for (const server of servers) {
      if (server == "home") { continue; }
      if (toRun <= 0) { break; }
      var availableThreads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / ramPerScript);
      availableThreads = Math.min(availableThreads, toRun);
      if (availableThreads <= 0) {continue;}
      ns.print("Running " + availableThreads + " threads of " + script + " on " + server + " with target " + target);
      await ns.exec(script, server, availableThreads, target, delay);
      toRun -= availableThreads;
    }
  // return 0 if we were able to run
  // with all the necessary threads,
  // and the remaining threads to run
  // otherwise
  return toRun;
}