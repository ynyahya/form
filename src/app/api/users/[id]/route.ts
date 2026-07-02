import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "PETUGAS") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      name: body.name,
      role: body.role,
      instansi: body.instansi,
      unitKerja: body.unitKerja,
      jabatan: body.jabatan,
      nip: body.nip,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      instansi: true,
      unitKerja: true,
      jabatan: true,
      nip: true,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
