const readline = require("readline");
const { loadCache, saveCache } = require("./cache");
const { searchQuestions } = require("./search");
const fs = require("fs");
const path = require("path");

// Folder path for matching questions
const matchingQuestionsFolder = path.join(__dirname, "matching_questions");

// Clear the folder contents
if (fs.existsSync(matchingQuestionsFolder)) {
  fs.rmSync(matchingQuestionsFolder, { recursive: true, force: true });
}
fs.mkdirSync(matchingQuestionsFolder);

// Load the cache at the start
loadCache();

// Save the cache on exit
process.on("exit", saveCache);
process.on("SIGINT", () => {
  console.log("Received SIGINT. Saving cache...");
  saveCache();
  process.exit();
});

// Prompt the user for input and search for questions
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the subject (Physics, Chemistry, Maths): ", (subject) => {
  rl.question("Enter keywords to search for: ", (keywords) => {
    searchQuestions(subject, keywords, matchingQuestionsFolder);
    rl.close();
  });
});
