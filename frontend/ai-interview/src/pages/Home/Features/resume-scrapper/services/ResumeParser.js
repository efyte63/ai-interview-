import axios from "axios";

const ResumeParser = async (file) => {
  try {
    const formData = new FormData();
      let token = localStorage.getItem("token")
      formData.append("resume", file);
    const response = await axios.post(
      "http://localhost:3000/scrape/resume",

      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.log("Resume Parser Service Error:", error);

    throw error;
  }
};

export default ResumeParser;
