import React from "react";

const AdminLoginLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-3rem)] w-full ">
      {children}
    </div>
  );
};

export default AdminLoginLayout;
