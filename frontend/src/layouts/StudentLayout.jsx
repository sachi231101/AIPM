import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import ProtectedLayout from "../components/ProtectedLayout/ProtectedLayout";

export default function StudentLayout() {
  return (
    <ProtectedLayout requiredRole="student">
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1 bg-light">
          <div className="container-fluid py-4">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  );
}
