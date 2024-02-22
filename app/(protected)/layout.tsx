import { Navbar } from "@/components/admin/navbar";
import { Sidebar } from "@/components/admin/sidebar";
import React from "react";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="flex">
        <div>
          <Sidebar />
        </div>
        <div className="w-full">
          <Navbar />
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProtectedLayout;
