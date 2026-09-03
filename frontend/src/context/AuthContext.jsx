import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");
    if (!token || !savedUser) {
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      return null;
    }
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await axios.post(`${API_URL}/login/`, {
        username_or_email: usernameOrEmail,
        password,
      });
      const data = response.data;
      const authToken = data.token || data.access;
      if (authToken) localStorage.setItem("access_token", authToken);
      if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || err.response?.data?.username_or_email?.[0] || err.response?.data?.password?.[0] || err.message || "Unable to connect to healthcare server. Please verify credentials.";
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
