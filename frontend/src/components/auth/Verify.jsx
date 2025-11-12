import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/authSlice";
import API from "../../api/axios";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  // const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const email = localStorage.getItem("emailVerify");
  const { status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (!email) navigate("/auth/login");
  }, [email, navigate]);
  useEffect(() => {
    if (status) navigate("/");
  }, [status, navigate]);

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!email) {
      alert("Session expired. Please sign up again.");
      navigate("/auth/signup");
      return;
    }
    try {
      const response = await API.post("auth/verify", {
        email,
        otp,
        type: location.state?.type,
      });
      if (location.state?.type == "reset") {
        alert("Password has been reset...");
        localStorage.removeItem("emailVerify");
        navigate("/auth/login");
      }
      if (location.state?.type == "signup") {
        dispatch(login({ userData: response.data.user }));

        alert("Account verified! Logging you in...");
        localStorage.removeItem("emailVerify");
        navigate("/");
      }
    } catch (error) {
      alert(error.response?.data?.message);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!email) {
      alert("Session expired. Please sign up again.");
      return;
    }
    setTimeLeft(30);

    try {
      await API.post("/auth/resendotp", {
        email,
        type: location.state?.type,
      });
      alert("New OTP sent to your email!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="w-full lg:w-2/5 bg-bg flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-white text-4xl font-bold mb-2">Verify OTP</h1>
          <p className="text-gray-400 text-sm mb-8">
            Enter the code sent to your email
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyOTP();
            }}
            className="space-y-6"
          >
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-dark-secondary focus:border-accent focus:outline-none transition-colors text-center text-lg tracking-widest"
              placeholder="Enter 6-digit OTP"
              required
            />

            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Verify
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={timeLeft > 0} // prevent resend until timer is 0
              className={`w-full border border-accent font-semibold py-3 rounded-lg transition-colors ${
                timeLeft > 0
                  ? "text-gray-400 border-gray-400 cursor-not-allowed"
                  : "text-accent hover:bg-accent hover:text-white"
              }`}
            >
              {timeLeft > 0 ? `Resend OTP in ${timeLeft}s` : "Resend OTP"}
            </button>
          </form>
        </div>
      </div>

      {/* Right panel */}
      <div
        className="hidden lg:flex w-3/5 bg-accent p-12 relative overflow-hidden"
        style={{
          backgroundImage: `url("/assets/auth_bg.jpeg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="my-60 relative z-10 max-w-2xl">
          <h2 className="text-white text-5xl font-bold mb-2">
            Email Verification
          </h2>
          <p className="text-purple-200 text-sm">
            Enter OTP to activate your account
          </p>
        </div>
      </div>
    </div>
  );
}
