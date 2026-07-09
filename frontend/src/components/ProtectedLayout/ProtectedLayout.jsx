import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Loading from "../Loading/Loading";

export default function ProtectedLayout({ children, requiredRole }) {
  const { user, role, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to={requiredRole === "admin" ? "/admin/login" : "/student/login"} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
