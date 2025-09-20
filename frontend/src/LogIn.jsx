import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import maryJoyLogo from "../../matjoylogo.jpg";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're coming from a logout action
  const isLogout = location.state?.logout === true;

  useEffect(() => {
    if (isLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [isLogout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Redirect based on role
      redirectBasedOnRole(data.user.role);

    } catch (err) {
      setError("Server error. Please try again.");
      setLoading(false);
    }
  };

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case "admin":
        navigate("/admin_dashboard", { replace: true });
        break;
      case "database_officer":
        navigate("/d_o_dashboard", { replace: true });
        break;
      case "coordinator":
        navigate("/coordinator_dashboard", { replace: true });
        break;
      case "sponsor":
        navigate("/sponsor_dashboard", { replace: true });
        break;
      default:
        setError("Unknown user role");
        setLoading(false);
    }
  };

  const testCredentials = (role) => {
    switch(role) {
      case 'admin':
        setIdentifier('admin@maryjoy.org');
        setPassword('admin123');
        break;
      case 'database_officer':
        setIdentifier('db.officer@maryjoy.org');
        setPassword('dbofficer123');
        break;
      case 'coordinator':
        setIdentifier('coordinator@maryjoy.org');
        setPassword('coordinator123');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header Section with Logo */}
        <div className="bg-blue-900 py-8 px-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-3 shadow-lg">
              <img 
                src="maryJoyLogo" 
                alt="Mary Joy Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden w-full h-full bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">MJ</span>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">MARY JOY ETHIOPIA</h1>
          <p className="text-blue-200 mt-2">Sponsorship Management System</p>
        </div>

        {/* Login Form Section */}
        <div className="px-8 py-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            Login to Your Account
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {isLogout && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700 text-sm font-medium">Successfully logged out</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                Email or Phone Number
              </label>
              <input
                id="identifier"
                type="text"
                placeholder="Enter your email or phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-blue-900 text-white rounded-lg font-semibold transition-all duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-800 hover:shadow-lg'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  LOGGING IN...
                </div>
              ) : (
                'LOGIN'
              )}
            </button>
          </form>

         
          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2024 Mary Joy Ethiopia. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
