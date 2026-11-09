import { useRef, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Realtime session settings
// ---------------------------------------------------------------------------
const TRANSCRIPTION_LANGUAGE = "en";

const buildSessionConfig = (role) => ({
  type: "session.update",
  session: {
    voice: "alloy",

    input_audio_noise_reduction: { type: "near_field" },

    input_audio_transcription: {
      model: "gpt-4o-transcribe",
      language: TRANSCRIPTION_LANGUAGE,
      prompt: `Technical job interview for the role: ${role}. Expect terms like React, Node.js, API, SQL, REST, JavaScript.`,
    },

    turn_detection: {
      type: "server_vad",
      threshold: 0.7,
      prefix_padding_ms: 300,
      silence_duration_ms: 900,
      create_response: true,
      interrupt_response: true,
    },

    instructions: `You are a professional interviewer interviewing a candidate for the role: ${role}.

Audio rules:
- The candidate may be in a noisy place. If the audio is unclear, cut off, silent, or you are not sure what was said, politely ask them to repeat. Never guess or answer based on unclear audio.
- Ignore background voices, TV, coughs, and other non-candidate sounds.
- Do not respond to very short noises or single filler sounds.

Speaking rules:
- Speak clearly at a calm, steady pace, in short sentences.
- Ask only one question at a time, then wait for the answer.
- Keep each reply brief and natural.`,
  },
});

const Interview = () => {
  const aud = useRef(null);

  const [role, setRole] = useState("");
  const [start, setStart] = useState(false);
  const [interviewid, setInterviewid] = useState("");
  const [status, setStatus] = useState("Not started");
  const [transcript, setTranscript] = useState([]);

  const interviewIdRef = useRef("");
  const processedItems = useRef(new Set());

  // -------------------------------------------------------------------------
  // WEBRTC + OPENAI REALTIME LOGIC (UNCHANGED)
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!start) return;

    let pc;
    let ms;
    let audioCtx;
    let cancelled = false;

    async function startConnection() {
      try {
        setStatus("Connecting...");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please login first");
        }

        pc = new RTCPeerConnection();

        const dataChannel = pc.createDataChannel("oai-events");

        dataChannel.onopen = () => {
    
          setStatus("Connected");

          dataChannel.send(JSON.stringify(buildSessionConfig(role)));
        };

        dataChannel.onclose = () => {
        };

        dataChannel.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "session.updated") {
              console.log("Session updated:", data.session);
            }

            if (data.type === "input_audio_buffer.speech_started") {
              setStatus("Listening...");
            }

            if (data.type === "input_audio_buffer.speech_stopped") {
              setStatus("Thinking...");
            }

            if (data.type === "response.done") {
              setStatus("Connected");
            }

            if (
              data.type === "conversation.item.input_audio_transcription.delta"
            ) {
              console.log("Candidate speaking:", data.delta);
            }

            if (
              data.type ===
              "conversation.item.input_audio_transcription.completed"
            ) {
              const text = data.transcript?.trim();
              const itemId = data.item_id;

              if (!text) {
                console.log("Empty transcription ignored");
                return;
              }

              if (itemId && processedItems.current.has(itemId)) {
                console.log("Duplicate transcription ignored:", itemId);
                return;
              }

              if (itemId) {
                processedItems.current.add(itemId);
              }

              console.log("Candidate said:", text);
              console.log("Audio item ID:", itemId);

              const currentInterviewId = interviewIdRef.current;
              console.log("Interview ID:", currentInterviewId);

              setTranscript((prev) => [...prev, text]);

              // TODO: Send completed transcript to your backend.
            }

            if (
              data.type === "conversation.item.input_audio_transcription.failed"
            ) {
              console.error("Transcription failed:", data.error);
            }

            if (data.type === "error") {
              console.error("Realtime API error:", data);
            }
          } catch (error) {
            console.error("Event parsing error:", error);
          }
        };

        dataChannel.onerror = (error) => {
          console.error("Data channel error:", error);
        };

        if (aud.current) {
          aud.current.autoplay = true;
          aud.current.playsInline = true;
        }

        pc.ontrack = (e) => {
          if (aud.current && e.streams[0]) {
            aud.current.srcObject = e.streams[0];

            aud.current.play().catch((error) => {
              console.warn("Audio playback error:", error);
            });
          }
        };

        // Microphone
        ms = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: { ideal: true },
            noiseSuppression: { ideal: true },
            autoGainControl: { ideal: true },
            channelCount: 1,
            sampleRate: { ideal: 24000 },
          },
        });

        if (cancelled) {
          ms.getTracks().forEach((t) => t.stop());
          return;
        }

        // Audio filtering
        let outgoingTrack = ms.getAudioTracks()[0];

        try {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          await audioCtx.resume();

          const source = audioCtx.createMediaStreamSource(ms);

          const highpass = audioCtx.createBiquadFilter();
          highpass.type = "highpass";
          highpass.frequency.value = 100;

          const lowpass = audioCtx.createBiquadFilter();
          lowpass.type = "lowpass";
          lowpass.frequency.value = 7500;

          const compressor = audioCtx.createDynamicsCompressor();
          compressor.threshold.value = -35;
          compressor.knee.value = 30;
          compressor.ratio.value = 4;
          compressor.attack.value = 0.005;
          compressor.release.value = 0.25;

          const destination = audioCtx.createMediaStreamDestination();

          source
            .connect(highpass)
            .connect(lowpass)
            .connect(compressor)
            .connect(destination);

          outgoingTrack = destination.stream.getAudioTracks()[0];
        } catch (filterError) {
          console.warn("Audio filter unavailable, using raw mic:", filterError);

          outgoingTrack = ms.getAudioTracks()[0];
        }

        pc.addTrack(outgoingTrack, ms);

        pc.onconnectionstatechange = () => {
          console.log("WebRTC state:", pc.connectionState);

          if (pc.connectionState === "connected") {
            setStatus("Connected");
          }

          if (
            pc.connectionState === "failed" ||
            pc.connectionState === "disconnected"
          ) {
            setStatus("Connection problem");
          }
        };

        // WebRTC offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Backend request
        const sdpResponse = await fetch("http://localhost:3000/start/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/sdp",
            Authorization: `Bearer ${token}`,
            "X-Interview-Role": role,
          },
          body: offer.sdp,
        });

        if (!sdpResponse.ok) {
          const errorText = await sdpResponse.text();
          throw new Error(errorText);
        }

        const result = await sdpResponse.json();

        if (!result.sdp || !result.interviewid) {
          throw new Error("Invalid response from backend");
        }

        interviewIdRef.current = result.interviewid;
        setInterviewid(result.interviewid);

        if (cancelled) return;

        await pc.setRemoteDescription({
          type: "answer",
          sdp: result.sdp,
        });

        console.log("WebRTC connection established");
        console.log("Interview ID:", result.interviewid);
      } catch (error) {
        console.error("WebRTC connection error:", error);

        if (!cancelled) {
          setStatus("Connection failed");
        }
      }
    }

    startConnection();

    // Cleanup
    return () => {
      cancelled = true;

      pc?.close();

      ms?.getTracks().forEach((track) => {
        track.stop();
      });

      audioCtx?.close().catch(() => {});

      if (aud.current) {
        aud.current.srcObject = null;
      }
    };
  }, [start, role]);

  // -------------------------------------------------------------------------
  // STATUS UI HELPERS
  // -------------------------------------------------------------------------

  const isConnected = status === "Connected";
  const isListening = status === "Listening...";
  const isThinking = status === "Thinking...";
  const hasError =
    status === "Connection failed" || status === "Connection problem";

  const statusColor = hasError
    ? "bg-red-400"
    : isConnected
      ? "bg-green-400"
      : isListening
        ? "bg-blue-400"
        : "bg-yellow-400";

  const statusTextColor = hasError
    ? "text-red-400"
    : isConnected
      ? "text-green-400"
      : isListening
        ? "text-blue-400"
        : "text-yellow-400";

  // -------------------------------------------------------------------------
  // INITIAL SCREEN
  // -------------------------------------------------------------------------

  if (!start) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080d19] px-5 py-12 text-white">
        {/* Background Effects */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px]" />

        <div className="relative z-10 w-full max-w-2xl">
          {/* Logo */}
          <div className="mb-10 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-2xl shadow-lg shadow-blue-600/30">
              ✦
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              AI <span className="text-blue-400">Interact</span>
              <span className="text-blue-500">.</span>
            </h1>
          </div>

          {/* Main Card */}
          <div className="rounded-3xl border border-white/10 bg-[#111827]/90 p-7 shadow-2xl backdrop-blur-xl sm:p-12">
            {/* Heading */}
            <div className="mb-9 text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold tracking-wider text-blue-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                AI POWERED INTERVIEW
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Your next interview.
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Your next big opportunity.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-400">
                Practice with an intelligent AI interviewer. Answer real-world
                questions, improve your confidence, and get one step closer to
                your dream job.
              </p>
            </div>

            {/* Instructions */}
            <div className="mb-8 rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-xl">🎙️</span>

                <h3 className="font-semibold text-white">Before we begin</h3>
              </div>

              <p className="text-sm leading-6 text-slate-400">
                For the best audio experience, use headphones with a microphone
                and sit in a quiet room. Make sure your browser has microphone
                permission enabled.
              </p>
            </div>

            {/* Role Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (role.trim()) {
                  setStart(true);
                }
              }}
            >
              <label className="mb-3 block text-sm font-semibold text-slate-200">
                What position are you preparing for?
              </label>

              <div className="relative mb-7">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-blue-400">
                  💼
                </span>

                <input
                  type="text"
                  placeholder="e.g. Full Stack Developer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#0b1120] py-4 pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-semibold text-white shadow-lg shadow-blue-900/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-600/30 active:scale-[0.98]"
              >
                Start Your Interview
                <span className="text-xl transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </form>

            {/* Features */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500">
              <span>✦ AI Powered</span>
              <span>🎙️ Real-time Voice</span>
              <span>⚡ Interactive</span>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-600">
            © 2026 AI Interact. Practice smarter. Interview better.
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // LIVE INTERVIEW SCREEN
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#080d19] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#0c1322]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <h1 className="text-xl font-bold">
            AI <span className="text-blue-400">Interact</span>
            <span className="text-blue-500">.</span>
          </h1>

          {/* Connection Status */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <span
              className={`h-2.5 w-2.5 animate-pulse rounded-full ${statusColor}`}
            />

            <span className={`text-xs font-medium ${statusTextColor}`}>
              {status}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {/* Page Heading */}
        <div className="mb-10">
          <div className="mb-3 text-xs font-semibold tracking-[0.2em] text-blue-400">
            LIVE INTERVIEW SESSION
          </div>

          <h2 className="text-3xl font-bold sm:text-4xl">
            Interview <span className="text-blue-400">Workspace</span>
          </h2>

          <p className="mt-3 text-sm text-slate-400">
            Focus on your answers. Your AI interviewer is listening.
          </p>
        </div>

        {/* Interview Details */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Role */}
          <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Interview Position
            </p>

            <h3 className="text-lg font-semibold text-white">💼 {role}</h3>
          </div>

          {/* Interview ID */}
          <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Interview ID
            </p>

            <p className="break-all font-mono text-sm text-blue-400">
              {interviewid || "Connecting..."}
            </p>
          </div>
        </div>

        {/* Interview Panels */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* AI Interviewer Panel */}
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#111827] px-6 py-14 text-center lg:col-span-2">
            {/* AI Avatar */}
            <div className="relative mb-9 flex h-36 w-36 items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full bg-blue-500/20 blur-2xl ${
                  isListening ? "animate-pulse" : ""
                }`}
              />

              {isListening && (
                <div className="absolute inset-0 animate-ping rounded-full border border-blue-500/30" />
              )}

              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-blue-400/30 bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl shadow-blue-900/50">
                <span className="text-5xl">🤖</span>
              </div>
            </div>

            <h3 className="text-2xl font-bold">AI Interviewer</h3>

            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
              Your personal AI interviewer is here to help you demonstrate your
              skills and experience.
            </p>

            {/* Live Status */}
            <div className="mt-8 flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-3">
              <span
                className={`h-2 w-2 animate-pulse rounded-full ${statusColor}`}
              />

              <span className={`text-sm font-medium ${statusTextColor}`}>
                {status}
              </span>
            </div>

            <p className="mt-5 text-xs text-slate-500">
              {isListening
                ? "Listening to your response..."
                : isThinking
                  ? "Processing your answer..."
                  : isConnected
                    ? "Speak naturally. Take your time."
                    : hasError
                      ? "Please check your connection."
                      : "Preparing your interview session..."}
            </p>
          </div>

          {/* Transcript Panel */}
          <div className="flex min-h-[450px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#111827] lg:col-span-3">
            {/* Transcript Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h3 className="font-bold text-white">Live Transcript</h3>

                <p className="mt-1 text-xs text-slate-500">
                  Your spoken responses appear here
                </p>
              </div>

              <div className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-400">
                🎙️ LIVE
              </div>
            </div>

            {/* Transcript Content */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {transcript.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl">
                    💬
                  </div>

                  <h4 className="font-semibold text-slate-300">
                    Your conversation starts here
                  </h4>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    Once you start answering questions, your responses will
                    automatically appear here.
                  </p>
                </div>
              ) : (
                transcript.map((line, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-2xl border border-white/5 bg-[#0b1120] p-5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-xs font-bold text-blue-400">
                      You
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-400">
                          Your Response
                        </span>

                        <span className="text-xs text-slate-600">#{i + 1}</span>
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                        {line}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Transcript Footer */}
            <div className="border-t border-white/10 px-6 py-4">
              <p className="text-center text-xs text-slate-500">
                ✦ Powered by AI Interact Real-time Voice Technology
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Information */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#111827] px-6 py-5 sm:flex-row">
          <div>
            <p className="text-sm font-semibold text-slate-300">
              Stay focused and speak confidently.
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Your responses are being transcribed in real time.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-blue-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            AI Interview Active
          </div>
        </div>
      </main>

      {/* Audio Output */}
      <audio ref={aud} autoPlay playsInline />
    </div>
  );
};

export default Interview;
