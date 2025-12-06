import React from "react";
import ComprehensiveDashboard from "./ComprehensiveDashboard";

interface MainDashboardProps {
  isDark: boolean;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ isDark }) => {
  return <ComprehensiveDashboard isDark={isDark} />;
};

export default MainDashboard;
