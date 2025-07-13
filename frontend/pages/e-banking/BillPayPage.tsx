import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../App";
import BillPayComponent from "../../components/BillPayComponent";
import { AuthRole } from "../../types";
import { portalClasses } from "../../theme";

const BillPayPage: React.FC = () => {
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

  return (
    <div className="space-y-8 py-2">
      <div className="text-center">
        <h1 className={`text-4xl font-bold ${portalClasses.primary} mb-2`}>
          Bill Pay Center
        </h1>
        <p className={`${portalClasses.textSecondary} text-lg`}>
          Manage all your bills and payments in one place
        </p>
      </div>

      <BillPayComponent />
    </div>
  );
};

export default BillPayPage;
