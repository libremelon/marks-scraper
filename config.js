const dotenv = require("dotenv");
const fs = require("fs");

// Function to load a specific .env file
function loadEnv(file) {
  const envConfig = dotenv.parse(fs.readFileSync(file));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

// Load the first .env file by default
loadEnv(".env1");

const apiKey = process.env.MARKS_APP_API_KEY;
const baseUrl = "https://web.getmarks.app/api/v3/cpyqb"; // Base URL for listing chapters

const subjects = {
  Physics: "615f0c729476412f48314dab",
  Chemistry: "615f0cf69476412f48314dac",
  Maths: "615f0d109476412f48314dad",
};

module.exports = { apiKey, baseUrl, subjects, loadEnv };
