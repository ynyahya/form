import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string; templateId: string } }
) {
  const template = await prisma.template.findUnique({
    where: { id: params.templateId },
    include: {
      form: {
        include: { fields: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(template);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; templateId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const template = await prisma.template.update({
    where: { id: params.templateId },
    data: {
      name: body.name,
      description: body.description,
      type: body.type,
      pageSize: body.pageSize,
      orientation: body.orientation,
      margins: body.margins,
      header: body.header,
      footer: body.footer,
      body: body.body,
      styles: body.styles,
    },
  });

  return NextResponse.json(template);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; templateId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.template.delete({ where: { id: params.templateId } });

  return NextResponse.json({ success: true });
}
