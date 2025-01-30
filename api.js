const axios = require("axios");
const { cache, saveCache } = require("./cache");
const { apiKey, baseUrl, subjects, loadEnv } = require("./config");

let currentEnv = 1; // Start with the first .env file

async function listChapters(subject) {
  const subjectCode = subjects[subject]; // Retrieve the subject code using the subject name

  if (!subjectCode) {
    console.error(
      `Invalid subject: ${subject}. Please choose from Physics, Chemistry, or Maths.`
    );
    return;
  }

  const cacheKey = `chapters_${subject}`;
  let chapters = cache.get(cacheKey);

  if (chapters) {
    // console.log(`Cache hit: ${cacheKey}`);
  } else {
    // console.log(`Cache miss: ${cacheKey}. Fetching from API...`);
    try {
      const response = await axios.get(
        `${baseUrl}/subjects/${subjectCode}/chapters?limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      chapters = response.data.data; // Assuming the API response has a `data` property containing chapters
      cache.set(cacheKey, chapters);
      console.log(`Cache set: ${cacheKey}`);
      saveCache(); // Save cache after every request
    } catch (error) {
      console.error(
        "Error fetching chapters:",
        error.response ? error.response.data : error.message
      );
    }
  }

  return chapters;
}

async function fetchQuestionDetails(questionId) {
  const cacheKey = `question_${questionId}`;
  let questionDetails = cache.get(cacheKey);

  if (questionDetails) {
    // console.log(`Cache hit: ${cacheKey}`);
  } else {
    // console.log(`Cache miss: ${cacheKey}. Fetching from API...`);
    const questionBaseUrl = "https://web.getmarks.app/api/v2/questions"; // Base URL for question details

    async function retryRequest(retries, delay) {
      try {
        const response = await axios.post(
          `${questionBaseUrl}/${questionId}`,
          {}, // Empty body
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              Cookie: process.env.MARKS_APP_API_COOKIE, // Include any required cookies here
            },
          }
        );

        questionDetails = response.data; // Return response data for further processing
        cache.set(cacheKey, questionDetails);
        console.log(`Cache set: ${cacheKey}`);
        saveCache(); // Save cache after every request
        return questionDetails;
      } catch (error) {
        if (error.response && error.response.status === 429 && retries > 0) {
          console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
          await new Promise((res) => setTimeout(res, delay));
          return retryRequest(retries - 1, delay * 2); // Exponential backoff
        } else if (
          error.response &&
          error.response.status === 429 &&
          retries === 0
        ) {
          // Switch to next environment file if rate limit is hit and retries are exhausted
          currentEnv = (currentEnv % 3) + 1; // Cycle between 1, 2, and 3
          console.log(`Switching to .env${currentEnv}`);
          loadEnv(`.env${currentEnv}`);
          return retryRequest(5, 1000); // Retry with new environment
        } else {
          console.error(
            "Error fetching question details:",
            error.response ? error.response.data : error.message
          );
          return null;
        }
      }
    }

    questionDetails = await retryRequest(5, 1000); // Retry 5 times with initial delay of 1 second
  }

  return questionDetails;
}

module.exports = { listChapters, fetchQuestionDetails };
