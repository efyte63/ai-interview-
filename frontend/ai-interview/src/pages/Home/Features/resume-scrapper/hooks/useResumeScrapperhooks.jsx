import { useState } from "react";
import ResumeParser from "../services/ResumeParser";

const useResumeScrapperhooks = () => {
    
    let [Link, setLink] = useState(null);
  
  async function handlesubmit(e) {
    e.preventDefault();

    // Check whether file is selected
    if (!Link) {
     
      return;
    }

    try {
      const data = await ResumeParser(Link);
     
    } catch (error) {
      console.log("Error submitting resume:", error);
    }
  }
  
  return {
    Link,
    setLink,
    handlesubmit,
  };
};

export default useResumeScrapperhooks;
