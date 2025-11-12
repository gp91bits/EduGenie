import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPass() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
    type: "reset",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await API.post("/auth/forgotPass", formData);

      localStorage.setItem("emailVerify", formData.email);
      if (response.status === 200) {
        navigate("/auth/verify", { state: { type: "reset" } });
      }
    } catch (error) {
      console.error(
        "Forgot Password Error:",
        error.response?.data || error.message
      );
      setError(error.response?.data.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-2/5 bg-bg flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-white text-4xl font-bold mb-2">Reset Password</h1>
          <p className="text-gray-400 text-sm mb-8">
            Enter your email and new password to reset your account.
          </p>
          {error && <p className="text-red-400">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter your email"
                required
              />
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="text-gray-400 text-sm block mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-dark-secondary focus:border-accent focus:outline-none transition-colors pr-12"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="text-gray-400 text-sm block mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-dark-secondary focus:border-accent focus:outline-none transition-colors pr-12"
                  placeholder="Re-enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>

      {/* Right Section */}
      <div
        className="hidden lg:flex w-3/5 bg-accent p-12 relative overflow-hidden"
        style={{
          backgroundImage: `url("/assets/auth_bg.jpeg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="my-60 relative z-10 max-w-2xl">
          <h2 className="text-white text-5xl font-bold mb-2">
            Forgot Password?
          </h2>
          <p className="text-purple-200 text-sm">
            Reset your password and get back to your account.
          </p>
        </div>
      </div>
    </div>
  );
}
