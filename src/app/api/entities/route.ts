import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { generateSlug } from "@/lib/utils";

const entitySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  fields: z
    .array(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        type: z.string().min(1),
        required: z.boolean().optional(),
        options: z.any().optional(),
        defaultValue: z.string().optional(),
        order: z.number().optional(),
      })
    )
    .optional(),
});

export async function GET() {
  const entities = await prisma.entity.findMany({
    include: {
      fields: { orderBy: { order: "asc" } },
      _count: { select: { records: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(entities);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "PETUGAS") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = entitySchema.parse(body);

    let slug = generateSlug(data.name);
    const existing = await prisma.entity.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const entity = await prisma.entity.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        icon: data.icon,
        fields: data.fields
          ? {
              create: data.fields.map((f, i) => ({
                ...f,
                order: f.order ?? i,
              })),
            }
          : undefined,
      },
      include: { fields: true },
    });

    return NextResponse.json(entity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
