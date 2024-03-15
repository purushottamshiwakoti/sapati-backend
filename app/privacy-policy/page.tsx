import prismadb from "@/lib/prismadb";
import React from "react";
import parse from "html-react-parser";

async function getData() {
  const data = await prismadb.privacy.findFirst({});
  return data;
}

const PrivacyPolicy = async () => {
  const data = await getData();
  return (
    <div className="flex items-center flex-col justify-center w-screen h-full mt-10 lg:mx-10 mx-3">
      <h2 className="text-xl font-bold text-blue-500">{data?.title}</h2>
      <div>
        <div className="mt-3">{data && parse(data.description)}</div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
