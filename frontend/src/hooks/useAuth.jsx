import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "student" | "admin"
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

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
