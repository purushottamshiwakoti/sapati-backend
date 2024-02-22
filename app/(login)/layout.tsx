import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f1f2f7]">
      {children}
    </div>
  );
};

export default AuthLayout;
