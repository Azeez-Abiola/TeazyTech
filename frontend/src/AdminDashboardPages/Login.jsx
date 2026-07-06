import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      }
      // Error is handled by AuthContext and shown via the shared error state if we use it
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#121212] transition-colors duration-300">
      {/* Left: image panel */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden">
        <img
          src="/images/workshopPhotos/IMG_7526.jpg"
          alt="Teazy Tech training session"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c1c3f]/80 via-[#12295c]/70 to-[#0c1c3f]/85" />

        <div className="relative z-10 flex items-center gap-3 p-10">
          <img
            src="/images/logo/teazy-tech-logo-icon-light.png"
            alt="Teazy Tech logo"
            className="h-10 w-10 object-contain"
          />
          <span className="text-xl font-bold text-white">Teazy Tech</span>
        </div>

        <div className="relative z-10 p-10 pb-14">
          <h2 className="max-w-md text-3xl font-bold leading-tight text-white">
            Empowering Educators with Technology
          </h2>
          <p className="mt-4 max-w-md text-white/75 leading-relaxed">
            Manage your blog posts, categories, and analytics — all in one
            place.
          </p>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile-only logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img
              src="/images/logo/teazy-tech-logo-icon.png"
              alt="Teazy Tech logo"
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Teazy Tech
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Sign in to the admin dashboard
          </p>

          {(error || authError) && (
            <div className="mt-6 bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded">
              <p className="text-sm">{error || authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#2F6FCC]">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  className="pl-10 block w-full rounded-lg bg-gray-50 dark:bg-[#242424] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-[#2F6FCC] focus:ring-2 focus:ring-[#2F6FCC]/20 p-3 border transition-all"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#2F6FCC]">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 block w-full rounded-lg bg-gray-50 dark:bg-[#242424] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-[#2F6FCC] focus:ring-2 focus:ring-[#2F6FCC]/20 p-3 border transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-[#2F6FCC] focus:outline-none transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2F6FCC] text-white py-3 px-4 rounded-lg hover:bg-[#2a63b6] focus:outline-none focus:ring-2 focus:ring-[#2F6FCC]/50 shadow-md shadow-blue-500/20 transition-all duration-300 font-semibold disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-sm">
            <p className="text-gray-500 dark:text-gray-500">
              Demo:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                admin@example.com / password
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
