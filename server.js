const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { searchQuestions } = require("./search");
const { loadCache, saveCache, countCachedQuestions } = require("./cache");
const fs = require("fs");
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "frontend")));

// Load the cache at the start
loadCache();
console.log(`Number of cached questions: ${countCachedQuestions()}`);

// Save the cache on exit
process.on("exit", saveCache);
process.on("SIGINT", () => {
  console.log("Received SIGINT. Saving cache...");
  saveCache();
  process.exit();
});

// Endpoint to handle search requests
app.post("/search", (req, res) => {
  const { subject, keywords } = req.body;
  const matchingQuestionsFolder = path.join(__dirname, "matching_questions");

  // Clear the folder contents
  if (fs.existsSync(matchingQuestionsFolder)) {
    fs.rmSync(matchingQuestionsFolder, { recursive: true, force: true });
  }
  fs.mkdirSync(matchingQuestionsFolder);

  // Search for questions
  searchQuestions(subject, keywords, matchingQuestionsFolder)
    .then(() => {
      // Read the matching questions from the folder and send them as response
      const files = fs.readdirSync(matchingQuestionsFolder);
      const results = files.map((file) => ({
        filename: file,
        content: JSON.parse(
          fs.readFileSync(path.join(matchingQuestionsFolder, file), "utf-8")
        ),
      }));
      res.json(results);
    })
    .catch((error) => {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while searching for questions." });
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
