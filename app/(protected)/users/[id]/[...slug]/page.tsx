import { BackButton } from "@/components/admin/back-button";
import prismadb from "@/lib/prismadb";
import { notFound } from "next/navigation";
import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AuthUser } from "@/lib/auth-user";

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

const ViewUserData = async ({ params }: { params: any }) => {
  const id = params.id;
  const slug = params.slug;
  const userData = await getData(id);
  if (!userData) {
    notFound();
  }
  let data;

  if (slug == "borrowings") {
    data = userData.borrowings.map((item) => ({
      from:
        item.sapati.created_by == userData.id
          ? item.sapati.fullName
          : item.sapati.created_user_name,
      amount: item.sapati.amount,
      status: item.sapati.sapati_satatus,
      takenDate: item.sapati.taken_date,
      returnDate: item.sapati.return_date,
      isSettled: item.sapati.confirm_settlement,
    }));
  } else if (slug == "lendings") {
    data = userData.lendings.map((item) => ({
      from:
        item.sapati.created_by == userData.id
          ? item.sapati.fullName
          : item.sapati.created_user_name,
      amount: item.sapati.amount,
      status: item.sapati.sapati_satatus,
      takenDate: item.sapati.taken_date,
      returnDate: item.sapati.return_date,
      isSettled: item.sapati.confirm_settlement,
    }));
  } else {
    notFound();
  }
  return (
    <div className="p-2">
      <div>
        <BackButton title="Go Back" href={`/users/${id}`} />
      </div>
      <div className="mt-2 text-zinc-700 font-medium capitalize ">
        <h2>
          You are viewing borrowings of{" "}
          {userData.first_name + " " + userData.last_name}
        </h2>
      </div>
      <div className="lg:mx-2">
        <DataTable columns={columns} data={data} searchKey="first_name" />
      </div>
    </div>
  );
};

export default ViewUserData;
