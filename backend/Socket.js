import WebSocket, { WebSocketServer } from "ws";
import { app } from "./index.js";
import { createServer } from "node:http";
import InterviewModel from "./src/database/InterviewSchema.js";
import {prepquestion} from "./src/utils/questionprep.js"
// =====================================
// 1. Create HTTP + WebSocket Server
// =====================================
export function createSocketServer() {
  const server = createServer(app);
  const wss = new WebSocketServer({
    server,
    path: "/ws",
  });
  wss.on("connection", (socket) => {
    console.log("Client connected");
    socket.on("message", (message) => {
      console.log("Message from client:", message.toString());
      socket.send(
        JSON.stringify({
          type: "message",
          data: "Message received successfully",
        }),
      );
    });
    socket.on("close", () => {
      console.log("Client disconnected");
    });
    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });
  return server;
}
// =====================================
// 2. Connect Backend to OpenAI
// =====================================
export async function connectingvoicemodel(callId , Interviewid ,userid , role) {
    const check = await InterviewModel.findOne({
        userid: userid,
        Interviewid: Interviewid
    });

    if (!check)
    {
        return new Error("wrong credentials"); 
    }
    const questions = await prepquestion(userid);
    const url = `wss://api.openai.com/v1/realtime?call_id=${callId}`;
    const ws = new WebSocket(url, {
    headers: {
        Authorization: "Bearer " + process.env.OPENAI_API_KEY,
      },
    });
    ws.on("open", async function open() {
    console.log("Connected to server.");    
    ws.send(
      JSON.stringify({
        type: "session.update",
        session: {
          type: "realtime",
          instructions: `You are a professional AI interviewer conducting an interview for the role of ${role}.
            Your task is to select the **3 most important questions** from the provided list: ${questions}.
            Follow these instructions:
            1. Prioritize questions related to the candidate's projects, previous work experience, responsibilities, and personal contributions.
            2. Evaluate the candidate's logical thinking, problem-solving ability, and role-specific technical knowledge.
            3. Ask moderately deep technical questions, including system design, architecture, and real-world scenarios wherever relevant to the role.
            4. **Ask only ONE question at a time.** Wait for the candidate's response before asking the next question.yess kepp this in moind very very inportant and if he is makeing pause make shure yo ask your question in 6 sec gap .
            5. Ask relevant follow-up questions if the candidate's answer is incomplete or unclear.
            6. Adjust the difficulty based on the candidate's performance.
            7. Maintain a professional and conversational interview style.
            **IMPORTANT:** Never ask all three questions together. Ask them one by one, and do not move forward until the candidate responds.
            Start with a brief greeting and then ask the first question.       
        `,
        },
      }),
    );
});
// Listen for and parse server events
ws.on("message", function incoming(message) {
  console.log(JSON.parse(message.toString()));
});
}



    //////////////////////
        
    //////////////////////