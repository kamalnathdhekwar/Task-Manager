import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import bgImage from "../../assets/task.jpg";
import Aos from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import axios from "axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get API URL with fallback
  const API_URL = import.meta.env.VITE_URL || "http://localhost:5000";
  console.log("API_URL:", API_URL); // Debug log

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${API_URL}/signup`,
        { name, email, password },
        { withCredentials: true }
      );
      
      toast.success("Signup successful! Please login.", {
        className: "text-center flex items-center justify-center flex-wrap flex-row",
      });
      
      setLoading(false);
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Signup failed", {
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
          Sign Up
        </h2>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          />
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
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <p className="text-sm text-center text-black">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup; 