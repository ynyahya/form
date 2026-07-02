import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { generateSlug } from "@/lib/utils";

const createFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export async function GET() {
  const forms = await prisma.form.findMany({
    include: {
      createdBy: { select: { name: true, email: true } },
      _count: { select: { templates: true, submissions: true, fields: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(forms);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "PETUGAS") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = createFormSchema.parse(body);

    let slug = generateSlug(data.title);
    const existing = await prisma.form.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const form = await prisma.form.create({
      data: {
        title: data.title,
        description: data.description,
        slug,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(form);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
