import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../../api/axios";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    year: "",
  });

  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (status) navigate("/");
  }, [status, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    try {
      const response = await API.post("/auth/signup", formData);

      localStorage.setItem("emailVerify", formData.email);

      if (response.status === 200) {
        navigate("/auth/verify", { state: { type: "signup" } });
      }
    } catch (error) {
      console.error("Signup Error:", error.response?.data || error.message);
      setError(error.response?.data.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Signup Form */}
      <div className="w-full lg:w-2/5 bg-bg flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-white text-4xl font-bold mb-2">Sign Up</h1>
          <p className="text-gray-400 text-sm mb-8">
            Create your student account
          </p>
          {error && <p className="text-red-400">{error}</p>}
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="text-gray-400 text-sm block mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-dark-secondary focus:border-accent focus:outline-none transition-colors"
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="text-gray-400 text-sm block mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-dark-secondary focus:border-accent focus:outline-none transition-colors"
                placeholder="Enter email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="text-gray-400 text-sm block mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-dark-secondary focus:border-accent focus:outline-none transition-colors pr-12"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Year */}
            <div>
              <label
                htmlFor="year"
                className="text-gray-400 text-sm block mb-2"
              >
                Year
              </label>
              <select
                id="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-dark-secondary focus:border-accent focus:outline-none transition-colors"
                required
              >
                <option value="">Select year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Sign Up
            </button>
          </form>

          {/* Already have account */}
          <div className="mt-8 text-center">
            <span className="text-gray-400 text-sm">
              Already have an account?
            </span>
            <button
              onClick={() => navigate("/auth/login")}
              className="bg-bg-top text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors ml-2"
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div
        className="hidden lg:flex w-3/5 bg-accent p-12 relative overflow-hidden"
        style={{
          backgroundImage: `url("/assets/auth_bg.jpeg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="my-60 relative z-10 max-w-2xl">
          <h2 className="text-white text-5xl font-bold mb-2">Join Us</h2>
          <p className="text-purple-200 text-sm">
            Sign up to create your student account
          </p>
        </div>
      </div>
    </div>
  );
}
