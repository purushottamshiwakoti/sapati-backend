import { BackButton } from "@/components/admin/back-button";
import { AddUserForm } from "@/components/admin/forms/add-user-form";
import React from "react";

const AddUserPage = () => {
  return (
    <>
      <div className="p-2">
        <BackButton title="Go back" href="/admins" />
        <div className="mt-5 ">
          <AddUserForm />
        </div>
      </div>
    </>
  );
};

export default AddUserPage;
