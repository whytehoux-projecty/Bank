import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../App";
import EnhancedUserDashboard from "../../components/EnhancedUserDashboard";
import { AuthRole } from "../../types";

const UserDashboardPage: React.FC = () => {
  const { currentUser, role } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (role === AuthRole.Guest || !currentUser) {
      router.push("/auth");
    }
  }, [role, currentUser, router]);

  // Don't render if not authenticated
  if (role === AuthRole.Guest || !currentUser) {
    return null;
  }

  return <EnhancedUserDashboard />;
};

export default UserDashboardPage;
