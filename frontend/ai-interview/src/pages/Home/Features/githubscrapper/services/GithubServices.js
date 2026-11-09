import axios from "axios";

export async function sendgithublink(link) {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `http://localhost:3000/scrape/github/${encodeURIComponent(link.trim())}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.log("Error from githubService:", error);
    throw error;
  }
}
