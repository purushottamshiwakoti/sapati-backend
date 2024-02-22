import { BackButton } from "@/components/admin/back-button";
import prismadb from "@/lib/prismadb";
import { notFound } from "next/navigation";
import React from "react";
import { UserDetail } from "./_components/user-detail";

async function getData(id: string) {
  try {
    const user = prismadb.user.findUnique({
      where: {
        id,
      },
      include: {
        borrowings: {
          include: {
            sapati: true,
          },
        },
        lendings: {
          include: {
            sapati: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}

const ViewUserPage = async ({ params }: { params: any }) => {
  const data = await getData(params.id);
  if (!data) {
    notFound();
  }

  return (
    <div className="p-2">
      <BackButton href="/users" title="Go Back" />
      <div className="mt-2">
        <UserDetail data={data} />
      </div>
    </div>
  );
};

export default ViewUserPage;
