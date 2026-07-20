import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { adminService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "student" | "admin" | "subadmin"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("apms_user");
    const savedRole = localStorage.getItem("apms_role");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setRole(savedRole);
    }
    setLoading(false);
  }, []);

  const login = (userData, userRole, token) => {
    setUser(userData);
    setRole(userRole);
    localStorage.setItem("apms_user", JSON.stringify(userData));
    localStorage.setItem("apms_role", userRole);
    localStorage.setItem("apms_token", token);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("apms_user");
    localStorage.removeItem("apms_role");
    localStorage.removeItem("apms_token");
  };

  // Live-update user data (used by permission sync)
  const updateUser = useCallback((userData) => {
    setUser(userData);
    setRole(userData.role);
    localStorage.setItem("apms_user", JSON.stringify(userData));
    localStorage.setItem("apms_role", userData.role);
  }, []);

  // Poll /admin/me every 15 seconds if logged in as admin/subadmin
  // This ensures permission changes by the main admin take effect immediately
  useEffect(() => {
    if (!user || (role !== "admin" && role !== "subadmin")) return;

    const syncPermissions = async () => {
      try {
        const res = await adminService.getMe();
        const freshUser = res.data.user;

        // Only update if permissions actually changed (avoid unnecessary re-renders)
        const currentPerms = JSON.stringify(user.permissions || {});
        const freshPerms = JSON.stringify(freshUser.permissions || {});
        if (currentPerms !== freshPerms || user.role !== freshUser.role) {
          updateUser(freshUser);
        }
      } catch {
        // Silently ignore — token expired or network error
      }
    };

    const interval = setInterval(syncPermissions, 3000); // every 3 seconds — feels immediate
    return () => clearInterval(interval);
  }, [user, role, updateUser]);

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
