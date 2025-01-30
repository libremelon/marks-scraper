document
  .getElementById("searchForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const subject = document.getElementById("subject").value;
    const keywords = document.getElementById("keywords").value;
    const resultsDiv = document.getElementById("results");

    resultsDiv.innerHTML = "Searching...";

    try {
      const response = await fetch("/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, keywords }),
      });

      const data = await response.json();
      resultsDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (error) {
      resultsDiv.innerHTML = "An error occurred while searching.";
    }
  });
