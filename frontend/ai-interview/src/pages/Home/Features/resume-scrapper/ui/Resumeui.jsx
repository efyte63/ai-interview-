import useResumeSchapperhooks from "../hooks/useResumeScrapperhooks";

const Resumeui = () => {
  const { Link, handlesubmit, setLink } = useResumeSchapperhooks();

  return (
    <div className="flex h-full min-w-0 flex-col rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-xl transition-all duration-300 hover:border-blue-500/30 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H7.5A2.25 2.25 0 005.25 4.5v15A2.25 2.25 0 007.5 21.75h9.75a2.25 2.25 0 002.25-2.25v-2.625"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 12.75h3m-3 3h7.5m-7.5-6h2.25"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Resume <span className="text-blue-400">Analyzer</span>
            </h2>

            <p className="mt-1 text-xs text-blue-400">
              AI-POWERED RESUME ANALYSIS
            </p>
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-400">
          Upload your resume and let us extract your skills, experience, and
          professional background to prepare you for your next interview.
        </p>
      </div>

      {/* Upload Form */}
      <form onSubmit={handlesubmit} className="flex flex-1 flex-col">
        <label className="mb-3 text-sm font-semibold text-slate-200">
          Upload Your Resume
        </label>

        {/* Upload Area */}
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-[#0b1120] px-5 py-8 text-center transition-all duration-300 hover:border-blue-500/60 hover:bg-blue-500/[0.03]">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-7 w-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5h10.5a2.25 2.25 0 002.25-2.25v-12a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 5.25v12a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>

          <p className="text-sm font-semibold text-white">
            Choose your PDF resume
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Upload your resume in PDF format
          </p>

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setLink(e.target.files[0])}
            className="mt-6 block w-full max-w-xs text-xs text-slate-400
            file:mr-3 file:rounded-lg file:border-0
            file:bg-blue-600 file:px-4 file:py-2.5
            file:font-semibold file:text-white file:cursor-pointer
            hover:file:bg-blue-500"
          />
        </div>

        {/* Selected File */}
        {Link && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-500/15 text-xs font-bold text-green-400">
              PDF
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-green-300">
                {Link.name}
              </p>

              <p className="mt-1 text-xs text-green-500">
                {(Link.size / 1024).toFixed(2)} KB
              </p>
            </div>

            <span className="text-green-400">✓</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-500 active:scale-[0.98]"
        >
          Analyze Resume
          <span>→</span>
        </button>

        <p className="mt-4 text-center text-xs text-slate-500">
          PDF format supported
        </p>
      </form>
    </div>
  );
};

export default Resumeui;
