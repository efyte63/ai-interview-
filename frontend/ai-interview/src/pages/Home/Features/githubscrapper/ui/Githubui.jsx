import useGithubScrapper from "../hooks/Githubscrapperhooks";

const Githubui = () => {
  const { Link, setLink, data, error, loading, handleSubmit } =
    useGithubScrapper();

  return (
    <div className="flex h-full min-w-0 flex-col rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-xl transition-all duration-300 hover:border-blue-500/30 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.83 1.23 1.83 1.23 1.07 1.84 2.8 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.62-2.8 5.65-5.48 5.95.43.37.81 1.1.81 2.22v3.3c0 .32.22.69.83.57A12 12 0 0 0 12 0Z" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              GitHub <span className="text-blue-400">Profile</span>
            </h2>

            <p className="mt-1 text-xs text-blue-400">
              DEVELOPER PROFILE ANALYSIS
            </p>
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-400">
          Let us explore your GitHub profile and understand your projects,
          repositories, and development experience.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <label className="mb-3 text-sm font-semibold text-slate-200">
          GitHub Profile URL
        </label>

        <input
          type="url"
          placeholder="https://github.com/username"
          value={Link}
          onChange={(e) => setLink(e.target.value)}
          required
          className="w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />

        <p className="mt-3 text-xs text-slate-500">
          Enter your public GitHub profile link.
        </p>

        {/* Search Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Fetching Profile..." : "Analyze GitHub Profile"}

          {!loading && <span>→</span>}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-6 flex items-center gap-3 text-sm text-blue-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          Analyzing your GitHub profile...
        </div>
      )}

      {/* Initial State */}
      {!data && !loading && !error && (
        <div className="mt-8 flex items-center gap-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-400">
            ⌘
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-300">
              Ready to explore?
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your GitHub analysis will start once you submit your profile.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Githubui;
