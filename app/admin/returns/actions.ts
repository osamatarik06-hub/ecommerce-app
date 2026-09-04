"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function updateReturnStatus(formData: FormData) {
  const returnId = formData.get("returnId") as string;
  const status = formData.get("status") as string;

  if (!returnId || !status) return;

  await prisma.returnRequest.update({
    where: { id: returnId },
    data: { status },
  });

  revalidatePath("/admin/returns");
}

export async function deleteReturnRequest(formData: FormData) {
  const returnId = formData.get("returnId") as string;
  if (!returnId) return;

  await prisma.returnRequest.delete({
    where: { id: returnId },
  });

  revalidatePath("/admin/returns");
}