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
      console.log(data);
      const html = data
        .map((element) => {
          const q_id = element.content.data._id;
          const q_year = element.content.data.previousYearPapers
            .map((e, i) => {
              return `${i + 1}. ${e.title}`;
            })
            .join(" / ");
          console.log(q_year);
          const url = `https://web.getmarks.app/cpyqb/question/${q_id}`;
          const html = `<pre><a href="${url}">${q_year}</a></pre>`;
          return html;
        })
        .join("\n");

      resultsDiv.innerHTML = html;
    } catch (error) {
      resultsDiv.innerHTML = `${error}`;
    }
  });
