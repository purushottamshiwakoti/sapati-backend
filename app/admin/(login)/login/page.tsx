import { CardWrapper } from "@/components/card-wrapper";
import { LoginForm } from "@/components/forms/login-form";
import React from "react";

const AdminLoginPage = () => {
  return (
    <>
      <CardWrapper
        title="Login to your account"
        className="w-[30rem] mx-3 lg:mx-0"
      >
        <LoginForm />
      </CardWrapper>
    </>
  );
};

export default AdminLoginPage;
