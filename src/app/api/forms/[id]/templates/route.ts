import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const templateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["PDF", "EXCEL", "WORD"]).optional(),
  pageSize: z.string().optional(),
  orientation: z.string().optional(),
  margins: z.any().optional(),
  header: z.any().optional(),
  footer: z.any().optional(),
  body: z.any(),
  styles: z.any().optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const templates = await prisma.template.findMany({
    where: { formId: params.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(templates);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = templateSchema.parse(body);

    const template = await prisma.template.create({
      data: {
        formId: params.id,
        name: data.name,
        description: data.description,
        type: data.type,
        pageSize: data.pageSize,
        orientation: data.orientation,
        margins: data.margins,
        header: data.header,
        footer: data.footer,
        body: data.body ?? { elements: [] },
        styles: data.styles,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
