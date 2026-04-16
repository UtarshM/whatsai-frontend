import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";

export default function ProtectedRoute() {
  const { isAuthenticated, isHydrating } = useAppContext();
  const location = useLocation();

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-2xl border border-border bg-card px-6 py-4 text-sm text-muted-foreground shadow-card">
          Loading workspace...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
