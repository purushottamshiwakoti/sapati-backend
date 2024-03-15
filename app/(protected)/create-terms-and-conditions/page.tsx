import { AddTermsForm } from "@/components/forms/add-terms-form";
import prismadb from "@/lib/prismadb";
import React from "react";

async function getData() {
  const data = await prismadb.terms.findFirst({});
  return data;
}

const CreateTermsAndConditions = async () => {
  const data = await getData();
  return (
    <>
      <div className="px-10 mt-4">
        <AddTermsForm data={data!} />
      </div>
    </>
  );
};

export default CreateTermsAndConditions;
