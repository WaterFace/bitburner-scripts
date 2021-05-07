export async function main(ns) {
  var files = ["wait-grow.js", "wait-hack.js", "wait-weak.js", "available-ram.js", "library.js", "botnet.js"];
  var prefix = "https://raw.githubusercontent.com/WaterFace/bitburner-scripts/master/";

  files.forEach(function(filename) {
    ns.wget(prefix + filename, filename);
  });
}