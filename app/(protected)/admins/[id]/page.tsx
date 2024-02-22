import { BackButton } from "@/components/admin/back-button";
import { EditUserForm } from "@/components/admin/forms/edit-user-form";
import prismadb from "@/lib/prismadb";
import { notFound } from "next/navigation";
import React from "react";

async function getData(id: string) {
  try {
    const user = prismadb.admin.findUnique({
      where: {
        id,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}

const EditUserPage = async ({ params }: { params: any }) => {
  const data = await getData(params.id);
  if (!data) {
    notFound();
  }
  return (
    <>
      <div className="p-2">
        <BackButton title="Go back" href="/admins" />
        <div className="mt-5 ">
          <EditUserForm
            email={data.email}
            fullname={data.full_name}
            id={data.id}
          />
        </div>
      </div>
    </>
  );
};

export default EditUserPage;
