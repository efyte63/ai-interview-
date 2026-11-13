import api from "../../../../../axios.js";

const ResumeParser = async (file) => {
  try {
    const formData = new FormData();

    const token = localStorage.getItem("token");

    formData.append("resume", file);

    const response = await api.post("/scrape/resume", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log("Resume Parser Service Error:", error);

    throw error;
  }
};

export default ResumeParser;
