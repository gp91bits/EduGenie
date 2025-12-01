import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import API from "../../api/axios";
import { login } from "../../store/authSlice";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (status || localStorage.getItem("accessToken")) {
      navigate("/", { replace: true });
    }
  }, [status, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // adjust to your response shape
      const token = res?.data?.accessToken 
      const user = res?.data?.user 

      if (!token) {
        setError("Login succeeded but server did not return a token.");
        return;
      }

      // persist token + user
      localStorage.setItem("accessToken", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      // ensure axios instance sends Authorization on all requests
      API.defaults.headers = API.defaults.headers || {};
      API.defaults.headers.common = API.defaults.headers.common || {};
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      dispatch(login({ user, accessToken: token }));
      const admins = import.meta.env.VITE_ADMIN.split(",").map((s) => s.trim());
      if (admins.includes(user.email)) {
        setTimeout(() => navigate("/admin#addNotes"), 0);
      } else {
        setTimeout(() => navigate("/"), 0);
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      setError(error.response?.data.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-2/5 bg-bg flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-white text-4xl font-bold mb-2">Login</h1>
          <p className="text-gray-400 text-sm mb-8">
            Enter your account details
          </p>
          {error && <p className="text-red-400">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-6">
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
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="text-left">
              <button
                type="button"
                onClick={() => navigate("/auth/forgot-pass")}
                className="text-gray-400 text-sm hover:text-white transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Login
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-gray-400 text-sm">
              Don't have an account?{" "}
            </span>
            <button
              onClick={() => navigate("/auth/signup")}
              className="bg-bg-top text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors ml-2"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Welcome Section */}
      <div
        className="hidden lg:flex w-3/5 bg-accent p-12 relative overflow-hidden"
        style={{
          backgroundImage: `url("/assets/auth_bg.jpeg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-md self-center lg:-mt-20 xl:mt-[-60px]">
          <h2 className="text-white text-xl lg:text-2xl xl:text-3xl font-bold mb-2 leading-tight">
            Welcome to
          </h2>
          <h2 className="text-white text-xl lg:text-2xl xl:text-3xl font-bold mb-3 leading-tight">
            Student Portal
          </h2>
          <p className="text-purple-200 text-xs lg:text-sm">
            Login to access your account
          </p>
        </div>
      </div>
    </div>
  );
}
