import prismadb from "@/lib/prismadb";
import React from "react";
import parse from "html-react-parser";

async function getData() {
  const data = await prismadb.terms.findFirst({});
  return data;
}

const TermsandCOndition = async () => {
  const data = await getData();
  return (
    <div className="flex items-center flex-col justify-center w-screen overflow-y-hidden  h-full mt-10 lg:mx-10 mx-3">
      <h2 className="text-xl font-bold text-blue-500">{data?.title}</h2>
      <div>
        <div className="mt-3">{data && parse(data.description)}</div>
        <div></div>
      </div>
    </div>
  );
};

export default TermsandCOndition;
