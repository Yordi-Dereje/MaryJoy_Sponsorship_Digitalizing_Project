import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/useraccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // store user in localStorage so session persists
      localStorage.setItem("user", JSON.stringify(data));

      // role-based navigation
      if (data.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.role === "sponsor") {
        navigate("/sponsor-dashboard");
      } else if (data.role === "user") {
        navigate("/d_o_dashboard");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-96">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Mary Joy Logo" className="h-16" />
        </div>

        <h2 className="text-2xl font-bold text-center text-[#032990] mb-6">
          Login to Your Account
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-3 bg-[#032990] text-white rounded-lg font-semibold hover:bg-[#EAA108] hover:text-[#032990] transition"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}
