import { useState } from "react";
import { sendgithublink } from "../services/GithubServices";

const useGithubScrapper = () => {
  const [Link, setLink] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setData(null);

      const result = await sendgithublink(Link);

      setData(result);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch GitHub profile");
    } finally {
      setLoading(false);
    }
  }

  return {
    Link,
    setLink,
    data,
    error,
    loading,
    handleSubmit,
  };
};

export default useGithubScrapper;
