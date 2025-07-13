import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../App";
import { AuthRole } from "../../types";
import ModernAdminDashboard from "../../components/ModernAdminDashboard";

const AdminDashboardPage: React.FC = () => {
  const { currentUser, role } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (
      role === AuthRole.Guest ||
      !currentUser ||
      currentUser.role !== AuthRole.Admin
    ) {
      router.push("/auth");
    }
  }, [role, currentUser, router]);

  // Don't render if not authenticated or not admin
  if (
    role === AuthRole.Guest ||
    !currentUser ||
    currentUser.role !== AuthRole.Admin
  ) {
    return null;
  }

  return <ModernAdminDashboard />;
};

export default AdminDashboardPage;
