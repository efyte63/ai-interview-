import  { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../axios.js";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful");
      navigate("/Homepage");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      {/* LEFT SIDE */}
      <div className="relative flex min-h-[500px] w-full flex-col overflow-hidden bg-black px-8 py-10 text-white md:min-h-screen md:w-1/2 md:px-10 lg:px-14 lg:py-12">
        <div className="pointer-events-none absolute -left-40 top-[35%] h-[350px] w-[650px] rounded-full bg-blue-700/30 blur-[120px]" />

        <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/20 blur-[110px]" />

        <div className="pointer-events-none absolute -left-20 top-[40%] h-64 w-[120%] -rotate-12 rounded-[50%] border-t-2 border-blue-600/70" />

        <div className="pointer-events-none absolute -left-20 top-[53%] h-72 w-[120%] rotate-[-15deg] rounded-[50%] border-t-2 border-blue-500/50" />

        <div className="pointer-events-none absolute -bottom-40 left-10 h-96 w-[90%] rotate-[-20deg] rounded-[50%] border-t border-blue-600/40" />

        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-blue-500">AI</span>
            <span className="text-white"> Interact</span>
            <span className="text-blue-500">.</span>
          </h1>
        </div>

        <div className="relative z-10 mt-16 md:mt-16 lg:mt-14">
          <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
            The smarter way to
            <br />
            prepare for your
            <br />
            <span className="text-blue-500">next big interview.</span>
          </h2>

          <p className="mt-6 max-w-lg text-sm leading-7 text-gray-300 sm:text-base">
            Practice real-world interviews with your personal AI interviewer.
            Get personalized questions, improve your communication, and build
            the confidence to stand out.
          </p>

          <p className="mt-5 text-sm font-medium text-blue-400">
            Your next opportunity starts with better preparation.
          </p>
        </div>

        <div className="pointer-events-none absolute bottom-24 left-5 select-none text-[100px] font-black tracking-tighter text-blue-500/[0.04] md:text-[130px]">
          INTERACT
        </div>

        <div className="relative z-10 mt-auto pt-16 text-sm text-gray-400">
          © 2026 AI Interact. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f5f5f5] px-6 py-12 md:w-1/2">
        <div className="w-full max-w-[360px]">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
              Welcome back!
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>

              <input
                type="email"
                placeholder="your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:from-blue-700 hover:to-blue-600 hover:shadow-lg active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
