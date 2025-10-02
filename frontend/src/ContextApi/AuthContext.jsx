/* eslint-disable react/prop-types */
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export const authContext = createContext();

const AuthContext = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [modalTask, setModalTask] = useState([]);
  const [tasks, setTasks] = useState({ ToDo: [], InProgress: [], Done: [] });
  const [allUsers, setAllUsers] = useState([]);

  // Attach token to axios requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Use the useQuery hook to fetch tasks
  const { data, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!user) return;
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/tasks?email=${user.email}`,
        { withCredentials: true }
      );
      return response.data;
    },
    enabled: !!user,
  });

  // Format the fetched tasks
  useEffect(() => {
    if (data) {
      // FIX: Use data.tasks if data is an object with a tasks array
      const tasksArray = Array.isArray(data) ? data : data.tasks;
      if (Array.isArray(tasksArray)) {
        const formattedTasks = tasksArray.reduce(
          (acc, task) => {
            acc[task.category] = acc[task.category] || [];
            acc[task.category].push(task);
            return acc;
          },
          { ToDo: [], InProgress: [], Done: [] }
        );
        setTasks(formattedTasks);
      }
    }
  }, [data]);

  // Toggle the theme
  const handleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Theme control on browser
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Manual login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/login`,
        { email, password },
        { withCredentials: true }
      );
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  // Manual signup
  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_URL}/signup`,
        { name, email, password },
        { withCredentials: true }
      );
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, message: error.response?.data?.message || "Signup failed" };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  // User info for context
  const info = {
    theme,
    handleTheme,
    user,
    setUser,
    setLoading,
    loading,
    modalTask,
    setModalTask,
    tasks,
    setTasks,
    refetch,
    allUsers,
    login,
    signup,
    logout,
    token,
  };

  return <authContext.Provider value={info}>{children}</authContext.Provider>;
};

export default AuthContext;
