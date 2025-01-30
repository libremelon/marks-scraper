const fs = require("fs");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 0, checkperiod: 0 }); // Persistent cache

// Function to save the cache to a file
function saveCache() {
  console.log("Saving cache to file...");
  fs.writeFileSync(
    "cache.json",
    JSON.stringify(cache.mget(cache.keys()), null, 2)
  );
}

// Function to load the cache from a file
function loadCache() {
  if (fs.existsSync("cache.json")) {
    console.log("Loading cache from file...");
    const data = JSON.parse(fs.readFileSync("cache.json"));
    cache.mset(
      Object.entries(data).map(([key, value]) => ({ key, val: value }))
    );
  }
}

// Function to count the number of cached questions
function countCachedQuestions() {
  const keys = cache.keys();
  const questionKeys = keys.filter((key) => key.startsWith("question_"));
  return questionKeys.length;
}

module.exports = { loadCache, saveCache, cache, countCachedQuestions };
