import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import dotenv from "dotenv";
dotenv.config();
import { githubresult } from "../utils/scrapegithub.js";
import  UserdataModel  from "../database/UserSchema.js";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export async function githubscrape(req, res) {
  try {
    const { github } = req.params;
    const userid = req.userid;

    let url;

    try {
      url = new URL(github);
    } catch {
      return res.status(400).json({
        error: "Please provide a valid GitHub profile URL",
      });
    }

    if (
      url.protocol !== "https:" ||
      url.hostname !== "github.com" ||
      url.port ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return res.status(400).json({
        error: "Please provide a valid GitHub profile URL",
      });
    }

    const pathParts = url.pathname.split("/").filter(Boolean);

    if (pathParts.length !== 1) {
      return res.status(400).json({
        error: "Please provide a GitHub profile link, not a repository link",
      });
    }

    const username = pathParts[0];

    const { user, repos } = await githubresult(username);

   const data = {
  repositories: repos.map((repo) => ({
    name: repo.name,
    description: repo.description,
    language: repo.language,
  })),
};
    
    let userdata = JSON.stringify(data);
  
    

    await UserdataModel.findOneAndUpdate(
      { userid },
      { githubdata: userdata },
      { new: true, upsert: true },
    );

    return res.status(200).json({
      success: true,
      userdata
    });
  } catch (error) {
    console.error(error);

    const status = error.message.startsWith("GitHub API error: 404")
      ? 404
      : error.message.startsWith("Rate limited")
        ? 429
        : 500;

    return res.status(status).json({
      error: error.message,
    });
  }
}
export async function resumescrape(req, res) {
  const userid = req.userid;

  let parser;

  try {
    // STEP 1: Check whether PDF is uploaded

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume",
      });
    }

    // STEP 2: Extract text from PDF using pdf-parse v2

    parser = new PDFParse({
      data: req.file.buffer,
    });

    const pdfData = await parser.getText();

    const extractedText = pdfData.text;

    // Check whether PDF contains exactly one page

    if (pdfData.total !== 1) {
      return res.status(400).json({
        success: false,
        message: "Resume must contain exactly one page.",
      });
    }

    if (!extractedText.trim()) {
      return res.status(400).json({
        success: false,
        message: "No readable text found in PDF. OCR may be required.",
      });
    }

    // STEP 3: Send extracted text to OpenAI

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",

      messages: [
        {
          role: "system",

          content: `
            You are an expert AI Resume Parser.

            Analyze the given resume and extract all information.

            Extract the following:

            1. Personal Information
            - Name
            - Email
            - Phone
            - LinkedIn
            - GitHub

            2. Professional Summary

            3. Skills
            - Technical Skills
            - Soft Skills

            4. Education
            - Degree
            - Institution
            - Start Year
            - End Year
            - CGPA or Percentage

            5. Work Experience
            - Company
            - Job Role
            - Duration
            - Responsibilities as bullet points

            6. Projects
            - Project Name
            - Technologies Used
            - Description as bullet points

            7. Certifications

            IMPORTANT RULES:

            - Extract only information present in the resume.
            - Never invent experience, skills or achievements.
            - Convert descriptions into clear bullet points.
            - Preserve numerical achievements accurately.
            - Missing information should be empty strings or arrays.
            - Return valid JSON only.
          `,
        },

        {
          role: "user",

          content: `
            Parse the following resume:

            ${extractedText}
          `,
        },
      ],

      response_format: {
        type: "json_schema",

        json_schema: {
          name: "resume_parser",

          strict: true,

          schema: {
            type: "object",

            properties: {
              personalInformation: {
                type: "object",

                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  phone: { type: "string" },
                  linkedin: { type: "string" },
                  github: { type: "string" },
                },

                required: ["name", "email", "phone", "linkedin", "github"],

                additionalProperties: false,
              },

              summary: {
                type: "string",
              },

              skills: {
                type: "object",

                properties: {
                  technical: {
                    type: "array",
                    items: { type: "string" },
                  },

                  soft: {
                    type: "array",
                    items: { type: "string" },
                  },
                },

                required: ["technical", "soft"],

                additionalProperties: false,
              },

              education: {
                type: "array",

                items: {
                  type: "object",

                  properties: {
                    degree: { type: "string" },
                    institution: { type: "string" },
                    startYear: { type: "string" },
                    endYear: { type: "string" },
                    grade: { type: "string" },
                  },

                  required: [
                    "degree",
                    "institution",
                    "startYear",
                    "endYear",
                    "grade",
                  ],

                  additionalProperties: false,
                },
              },

              experience: {
                type: "array",

                items: {
                  type: "object",

                  properties: {
                    company: { type: "string" },
                    role: { type: "string" },
                    duration: { type: "string" },

                    bulletPoints: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },

                  required: ["company", "role", "duration", "bulletPoints"],

                  additionalProperties: false,
                },
              },

              projects: {
                type: "array",

                items: {
                  type: "object",

                  properties: {
                    projectName: { type: "string" },

                    technologies: {
                      type: "array",
                      items: { type: "string" },
                    },

                    bulletPoints: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },

                  required: ["projectName", "technologies", "bulletPoints"],

                  additionalProperties: false,
                },
              },

              certifications: {
                type: "array",

                items: {
                  type: "string",
                },
              },
            },

            required: [
              "personalInformation",
              "summary",
              "skills",
              "education",
              "experience",
              "projects",
              "certifications",
            ],

            additionalProperties: false,
          },
        },
      },
    });

    // STEP 4: Convert AI response into JSON

    const resumeData = JSON.stringify(response.choices[0].message.content);

    await UserdataModel.findOneAndUpdate(
      { userid },
      {
        $set: {
          resumedata: resumeData,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );
    return res.status(200).json({
      success: true,
      message: "Resume scraped successfully",
      data: resumeData,
    });
  } catch (error) {
    console.error("Resume Scraper Error:", error);

    return res.status(500).json({
      success: false,
      message: "Resume processing failed",
      error: error.message,
    });
  } finally {
    // STEP 6: Clean up PDF parser

    if (parser) {
      await parser.destroy();
    }
  }
}
