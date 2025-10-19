// src/hooks/TabContainer.tsx
import React from "react";
import { useActiveTab } from "./ActiveTabContext";
import { useUserRole } from "./UserContext";

import LandingPage from "../screens/Landing3";
import AdminDashboard from "../screens/Admin/AdminDashboard";
import StaffDashboard from "../screens/Volunteer/StaffDashboard";
import BeneficiaryDashboard from "../screens/Beneficiary/BeneficiaryDashboard";
import ProfileScreen from "../screens/InfoProfile";

type Tab = "home" | "dashboard" | "profile";

export default function TabContainer() {
  const { activeTab } = useActiveTab();
  console.log("Active Tab:", activeTab); // Para debug

  switch (activeTab as Tab) {
    case "home":
      return <LandingPage />;
    case "dashboard":
      return <DashboardMapWrapper />;
    case "profile":
      return <ProfileScreen />;
    default:
      return <LandingPage />;
  }
}

function DashboardMapWrapper() {
  const { role } = useUserRole();
  console.log("User Role:", role); // Para debug

  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "staff":
      return <StaffDashboard />;
    case "beneficiary":
      return <BeneficiaryDashboard />;
    default:
      return <BeneficiaryDashboard />;
  }
}