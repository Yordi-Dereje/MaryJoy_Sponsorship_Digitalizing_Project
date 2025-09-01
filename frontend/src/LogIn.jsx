import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import maryJoyLogo from 'C:/Users/Hp/Desktop/MaryJoy_Sponsorship_Digitalizing_Project/matjoylogo.jpg';

// Mock user data for demonstration
const mockUsers = [
  { email: "admin@maryjoy.org", password: "admin123", role: "admin" },
  { email: "sponsor@maryjoy.org", password: "sponsor123", role: "sponsor" },
  { email: "user@maryjoy.org", password: "user123", role: "user" },
];

function LogIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Find user
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      setError("Invalid email or password");
      return;
    }

    // Navigate based on role
    if (user.role === "admin") {
      navigate("/admin-dashboard");
    } else if (user.role === "sponsor") {
      navigate("/sponsor-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-green-200">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={maryJoyLogo}
            alt="Mary Joy Charity Logo"
            className="w-28 h-28 object-contain animate-pulse"
          />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8 tracking-wide">
          Welcome to Mary Joy
        </h2>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 block w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-300 focus:border-green-300 outline-none transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="mt-2 block w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-300 focus:border-green-300 outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-400 to-blue-400 text-white py-3 rounded-xl font-semibold hover:from-green-500 hover:to-blue-500 shadow-lg transition-all"
          >
            Login
          </button>
        </form>

        {/* Forgot password */}
        <div className="text-center mt-4">
          <a
            href="#"
            className="text-sm text-green-500 hover:text-blue-500 hover:underline transition-colors"
          >
            Forgot your password?
          </a>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-8">
          © 2025 Mary Joy Charity Organization. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default LogIn;
