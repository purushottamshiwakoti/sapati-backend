import { AddPrivacyPolicyForm } from "@/components/forms/add-privacy-policy-form";
import prismadb from "@/lib/prismadb";
import React from "react";

async function getData() {
  const data = await prismadb.privacy.findFirst({});
  return data;
}

const CreatePrivacyPolicy = async () => {
  const data = await getData();
  return (
    <>
      <div className="px-10 mt-4">
        <AddPrivacyPolicyForm data={data!} />
      </div>
    </>
  );
};

export default CreatePrivacyPolicy;
