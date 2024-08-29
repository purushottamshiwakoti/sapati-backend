import prismadb from "./prismadb";

export const verifyBearerToken = async (token: any) => {
  try {
    const existingToken = await prismadb.bearerToken.findFirst({
      where: {
        token,
      },
    });
    return existingToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};
