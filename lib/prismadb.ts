import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Function to initialize and return the Prisma client
function initPrisma() {
  const prisma = new PrismaClient();
  return prisma;
}

const prismadb = globalThis.prisma || initPrisma();

// Only initialize Prisma if it's not already defined
if (!globalThis.prisma) {
  globalThis.prisma = prismadb;
}

export default prismadb;
