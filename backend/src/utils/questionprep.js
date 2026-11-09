import dotenv from "dotenv";
import OpenAI from "openai";
import UserdataModel from "../database/UserSchema.js";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function prepquestion(userid) {
  try {
    // STEP 1: Fetch user data
    const data = await UserdataModel.findOne({ userid });


    if (!data) {
      throw new Error("Unable to find user data");
    }
     
      
    // STEP 2: Get GitHub and resume data
    const github = data.githubdata;
    const resume = data.resumedata;

    // STEP 3: Convert objects into readable JSON
    const context = JSON.stringify(
      {
        github,
        resume,
      },
      null,
      2,
    );

    
    
    // STEP 4: Generate 5 interview questions
    const response = await client.responses.create({
      model: "gpt-6-luna",

      instructions: `
        You are an expert AI technical interviewer.

        Analyze the candidate's resume and GitHub profile.

        Generate exactly 5 personalized interview questions.

        Rules:
        1. Questions must be based on the provided information.
        2. Ask about actual projects, technologies and experience.
        3. Avoid generic interview questions.
        4. Do not invent projects, skills or experience.
        5. Cover different aspects of the candidate's profile.
        6. Make questions clear and natural.
      `,

      input: `
        Candidate information:

        ${context}
      `,

      text: {
        format: {
          type: "json_schema",
          name: "interview_questions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              q1: { type: "string" },
              q2: { type: "string" },
              q3: { type: "string" },
              q4: { type: "string" },
              q5: { type: "string" },
            },
            required: ["q1", "q2", "q3", "q4", "q5"],
            additionalProperties: false,
          },
        },
      },
    });

    // STEP 5: Parse AI response
    if (!response.output_text) {
      throw new Error("AI returned an empty response");
    }

    const questions = JSON.stringify(response.output_text);
      console.log(questions);
      
    // STEP 6: Return questions
    return questions;
  } catch (error) {
    console.error("Question generation error:", error);
    throw error;
  }
}
