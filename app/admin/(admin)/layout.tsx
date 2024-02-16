import { Navbar } from "@/components/nav-bar";
import { Sidebar } from "@/components/sidebar";
import React from "react";

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="">
      <div className="flex space-x-10">
        <Sidebar />
        <div className="w-full">
          <Navbar />
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
