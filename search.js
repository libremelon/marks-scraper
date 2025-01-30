const { listChapters, fetchQuestionDetails } = require("./api");
const fs = require("fs");
const { apiKey, baseUrl } = require("./config");
const axios = require("axios");
const cliProgress = require("cli-progress");
const path = require("path");

async function searchQuestions(subject, keywords, matchingQuestionsFolder) {
  const pLimit = await import("p-limit"); // Dynamic import of p-limit
  const limit = pLimit.default(5); // Limit the number of concurrent requests to 5

  const chapters = await listChapters(subject);

  if (!chapters) {
    console.error("No chapters found for the specified subject.");
    return;
  }

  // Calculate the total number of questions
  let totalQuestions = 0;
  for (const chapter of chapters) {
    const response = await axios.get(
      `${baseUrl}/chapters/${chapter._id}/details`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    totalQuestions += response.data.data.questions.length;
  }

  // Initialize the progress bar
  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progressBar.start(totalQuestions, 0);

  for (const chapter of chapters) {
    try {
      const response = await axios.get(
        `${baseUrl}/chapters/${chapter._id}/details`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const questions = response.data.data.questions; // Assuming the API response has a `data` property containing questions

      // Fetch details for all questions concurrently with limited concurrency
      const fetchQuestionPromises = questions.map((questionId) =>
        limit(async () => {
          const questionDetails = await fetchQuestionDetails(questionId);
          // Check if the question details contain the keywords
          if (
            questionDetails &&
            questionDetails.data.question.text.includes(keywords)
          ) {
            // Save the matching question details to a file synchronously
            const fileName = path.join(
              matchingQuestionsFolder,
              `matching_questions_${subject}_${chapter.title}.json`.replace(
                /\s+/g,
                "_"
              )
            );
            try {
              fs.writeFileSync(
                fileName,
                JSON.stringify(questionDetails, null, 2)
              );
              console.log(
                `Matching question details have been saved to ${fileName}`
              );
            } catch (err) {
              console.error("Error writing to file:", err);
            }
          }
          progressBar.increment(); // Update the progress bar
        })
      );

      // Wait for all question details to be fetched
      await Promise.all(fetchQuestionPromises);
    } catch (error) {
      console.error(
        "Error fetching questions:",
        error.response ? error.response.data : error.message
      );
    }
  }

  // Stop the progress bar when all questions are processed
  progressBar.stop();
}

module.exports = { searchQuestions };
