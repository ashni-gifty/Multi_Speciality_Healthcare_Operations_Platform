import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/login/`, {
        username,
        password,
      });

      console.log("LOGIN RESPONSE:", response.data);

      const { access, refresh, user } = response.data;

      if (access) {
        localStorage.setItem("access", access);
      }

      if (refresh) {
        localStorage.setItem("refresh", refresh);
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
      }

      return response.data;
    } catch (error) {
      console.error("LOGIN API ERROR:", error.response?.data);

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// IMPORTANT: Login.jsx uses this
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
};

export default AuthContext;