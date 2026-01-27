import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Verify token with backend
          const response = await apiService.verifyToken();
          if (response.success) {
            setUser(response.data.user);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          // Clear invalid token
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          // Don't redirect here as it might cause infinite loops
          // Set user to null to prevent context errors
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password, token) => {
    try {
      const response = await apiService.login(email, password, token);
      if (response.success) {
        const { user: userData, token } = response.data;

        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const signup = async (name, email, password, phone, designation) => {
    try {
      const response = await apiService.register({
        name,
        email,
        password,
        phone,
        designation,
      });

      if (response.success) {
        const { user: userData, token } = response.data;

        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.updateProfile(profileData);
      if (response.success) {
        const updatedUser = response.data.user;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await apiService.updatePassword(
        currentPassword,
        newPassword,
      );
      return response.success;
    } catch (error) {
      console.error("Password update error:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.getProfile();
      if (response.success) {
        const userData = response.data.user;
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.error("Refresh user error:", error);
      // If refresh fails, logout user
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        updateProfile,
        updatePassword,
        refreshUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
