import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Loading from "../Loading/Loading";

export default function ProtectedLayout({ children, requiredRole, requiredPermission }) {
  const { user, role, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to={requiredRole === "admin" ? "/admin/login" : "/student/login"} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    if (!(requiredRole === "admin" && role === "subadmin")) {
      return <Navigate to="/" replace />;
    }
  }

  if (role === "subadmin" && requiredPermission) {
    const perms = user.permissions || {};
    if (!perms[requiredPermission]) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
}
