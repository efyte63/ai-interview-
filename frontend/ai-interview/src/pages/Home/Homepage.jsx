import Githubui from "./Features/githubscrapper/ui/Githubui";
import Resumeui from "./Features/resume-scrapper/ui/Resumeui";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080d19] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#0b1120]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-blue-500">AI</span> Interact
            <span className="text-blue-500">.</span>
          </h1>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-400 sm:block">
              Your AI interview workspace
            </span>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 font-semibold text-blue-400">
              AI
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard */}
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-medium tracking-wide text-blue-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></span>
            YOUR PERSONAL INTERVIEW WORKSPACE
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Get ready for your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              next opportunity.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Build your professional profile, upload your resume, and let AI
            Interact help you prepare for your next big interview.
          </p>
        </div>

        {/* Section Heading */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Prepare your profile
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Complete these steps before starting your interview.
            </p>
          </div>

          <span className="hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400 sm:block">
            2 preparation tools
          </span>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          <Githubui />

          <Resumeui />
        </div>

        {/* Interview CTA */}
        <div className="relative mt-10 overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/80 via-[#111d3b] to-indigo-950/80 p-7 sm:p-9">
          {/* Background Glow */}
          <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full bg-blue-500/20 blur-[100px]" />

          <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xl">✦</span>
                <span className="text-xs font-semibold tracking-[0.2em] text-blue-400">
                  READY WHEN YOU ARE
                </span>
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Your next interview starts here.
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Put your preparation to the test with your AI interviewer.
              </p>
            </div>

            <button
              onClick={() => navigate("/Interview")}
              className="group flex w-full shrink-0 items-center justify-center gap-3 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-900/30 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-500 hover:shadow-blue-500/20 active:scale-95 md:w-auto"
            >
              Start AI Interview
              <span className="text-lg transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 AI Interact. All rights reserved.</p>
          <p>Practice smarter. Interview better.</p>
        </footer>
      </main>
    </div>
  );
};

export default Homepage;
