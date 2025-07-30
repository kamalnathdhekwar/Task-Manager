import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import bgImage from "../../assets/task.jpg";
import Aos from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get API URL with fallback
  const API_URL = import.meta.env.VITE_URL || "http://localhost:5000";
  console.log("API_URL:", API_URL); // Debug log

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        { email, password },
        { withCredentials: true }
      );
      
      // Store user data and token in localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      
      // Set axios default header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      
      toast.success("Login Successfully", {
        className: "text-center flex items-center justify-center flex-wrap flex-row",
      });
      
      setLoading(false);
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid email or password", {
          className: "text-center flex items-center justify-center flex-wrap flex-row",
        }
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    Aos.init({
      duration: 1500,
      delay: 300,
      once: true,
    });
  }, []);

  return (
    <div
      style={{ backgroundImage: `url(${bgImage})` }}
      className="h-screen w-screen flex justify-center items-center bg-cover bg-center px-6 relative"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
      <div
        data-aos="zoom-in"
        className="relative z-10 w-full max-w-md p-8 flex flex-col justify-center items-center rounded-xl space-y-6 bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl"
      >
        <h2 className="text-3xl lg:text-4xl font-extrabold text-center text-black tracking-wide">
          Login
        </h2>
        <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm cursor-pointer transition-all duration-300 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-sm text-center text-black">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
