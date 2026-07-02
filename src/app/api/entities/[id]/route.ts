import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const entity = await prisma.entity.findUnique({
    where: { id: params.id },
    include: {
      fields: { orderBy: { order: "asc" } },
      records: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!entity) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(entity);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "PETUGAS") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  if (body.fields) {
    await prisma.entityField.deleteMany({ where: { entityId: params.id } });
    await prisma.$transaction(
      body.fields.map((f: { name: string; slug: string; type: string; required?: boolean; options?: unknown; defaultValue?: string; order?: number }, i: number) =>
        prisma.entityField.create({
          data: {
            entityId: params.id,
            name: f.name,
            slug: f.slug,
            type: f.type,
            required: f.required,
            options: f.options as undefined,
            defaultValue: f.defaultValue,
            order: f.order ?? i,
          },
        })
      )
    );
  }

  const entity = await prisma.entity.update({
    where: { id: params.id },
    data: {
      name: body.name,
      description: body.description,
      icon: body.icon,
    },
    include: { fields: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(entity);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "PETUGAS") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.entity.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
