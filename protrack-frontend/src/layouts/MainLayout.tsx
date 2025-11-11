import React from "react";
import Navigation from "../components/Navigation";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      <Navigation />
      <main>{children}</main>
    </div>
  );
};

export default MainLayout;
