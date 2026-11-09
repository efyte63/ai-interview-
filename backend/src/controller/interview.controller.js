import dotenv from "dotenv";
import InterviewModel from "../database/InterviewSchema.js";
import crypto from "node:crypto";
import { connectingvoicemodel } from "../../Socket.js";

dotenv.config();

// Build the session config per interview so the role can go into the instructions.
function buildSessionConfig(role) {
  return JSON.stringify({
    type: "realtime",
    model: "gpt-realtime-2.1", // keep whatever model works for your account
    instructions: `You are a professional interviewer interviewing a candidate for the role: ${role}.

Audio rules:
- The candidate may be in a noisy place. If the audio is unclear, cut off, silent, or you are not sure what was said, politely ask them to repeat. Never guess or answer based on unclear audio.
- Ignore background voices, TV, coughs and other non-candidate sounds.
- Do not respond to very short noises or single filler sounds.

Speaking rules:
- Speak clearly at a calm, steady pace, in short sentences.
- Ask only one question at a time, then wait for the answer.
- Keep each reply brief and natural.`,
    audio: {
      input: {
        // Clean the audio before VAD and the model hear it.
        // "near_field" = headset / laptop mic, "far_field" = room mic.
        noise_reduction: { type: "near_field" },

        transcription: {
          model: "gpt-4o-transcribe", // try this vs "gpt-realtime-whisper" and compare
          language: "en",
          // No prompt here: it can bias the transcript on general speech.
          // Add one back only if your interviews are full of technical terms.
        },

        // Less sensitive to noise, and does not cut candidates off while they think.
        turn_detection: {
          type: "server_vad",
          threshold: 0.7,
          prefix_padding_ms: 300,
          silence_duration_ms: 900,
          create_response: true,
          interrupt_response: true,
        },
      },
      output: {
        voice: "marin",
      },
    },
  });
}

export async function interviewsession(req, res) {
  const userid = req.userid;

  // The frontend sends the SDP as the body (text), so req.body is a string.
  // The role arrives in a header, not in req.body.
  const role = req.headers["x-interview-role"] || "general";

  const interviewid = crypto.randomUUID();

  try {
    await InterviewModel.create({
      userid: userid,
      Interviewid: interviewid,
    });

    const fd = new FormData();
    fd.set("sdp", req.body); // needs express.text({ type: "application/sdp" })
    fd.set("session", buildSessionConfig(role));

    const r = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        // Use a real hash of the user id, not the literal text.
        "OpenAI-Safety-Identifier": crypto
          .createHash("sha256")
          .update(String(userid))
          .digest("hex"),
      },
      body: fd,
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("Realtime call failed:", r.status, errText);
      return res.status(502).json({ error: "Failed to start voice session" });
    }

    const sdp = await r.text();
    const location = r.headers.get("location");
    const callId = location?.split("/").pop();

    res.send({ sdp, interviewid });

    console.log("callId:", callId);
    connectingvoicemodel(callId, interviewid, userid, role);
  } catch (error) {
    console.error("Session error:", error);
    res.status(500).json({ error: "Failed to start session" });
  }
}
