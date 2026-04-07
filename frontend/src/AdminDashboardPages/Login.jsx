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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#121212] transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden transition-colors duration-300 border border-transparent dark:border-gray-800">
        <div className="bg-[#e94235] px-6 py-8 text-white text-center">
          <h2 className="text-2xl font-bold">Teazy Tech Admin</h2>
          <p className="mt-2 text-white/80">Sign in to your account</p>
        </div>

        <div className="p-8">
          {(error || authError) && (
            <div className="mb-6 bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded">
              <p className="text-sm">{error || authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#e94235]">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  className="pl-10 block w-full rounded-lg bg-gray-50 dark:bg-[#242424] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-[#e94235] focus:ring-2 focus:ring-[#e94235]/20 p-3 border transition-all"
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#e94235]">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 block w-full rounded-lg bg-gray-50 dark:bg-[#242424] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-[#e94235] focus:ring-2 focus:ring-[#e94235]/20 p-3 border transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-[#e94235] focus:outline-none transition-colors"
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
                className="w-full bg-[#e94235] text-white py-3 px-4 rounded-lg hover:bg-[#d23c30] focus:outline-none focus:ring-2 focus:ring-[#e94235]/50 shadow-md shadow-red-500/20 transition-all duration-300 font-semibold disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-sm">
            <p className="text-gray-500 dark:text-gray-500">
              Demo: <span className="font-medium text-gray-700 dark:text-gray-300">admin@example.com / password</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
