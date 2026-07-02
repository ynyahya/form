import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const fieldSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  type: z.string().min(1),
  label: z.string().min(1),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  tooltip: z.string().optional(),
  required: z.boolean().optional(),
  readonly: z.boolean().optional(),
  hidden: z.boolean().optional(),
  defaultValue: z.string().optional(),
  validation: z.any().optional(),
  conditionalLogic: z.any().optional(),
  options: z.any().optional(),
  formula: z.string().optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  width: z.string().optional(),
  alignment: z.string().optional(),
  mask: z.string().optional(),
  order: z.number().optional(),
  parentId: z.string().optional(),
  entityFieldId: z.string().optional(),
});

const batchSchema = z.object({
  fields: z.array(fieldSchema),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const fields = await prisma.formField.findMany({
    where: { formId: params.id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(fields);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    if (body.fields) {
      const data = batchSchema.parse(body);

      await prisma.formField.deleteMany({ where: { formId: params.id } });

      const created = await prisma.$transaction(
        data.fields.map((field, index) =>
          prisma.formField.create({
            data: {
              formId: params.id,
              ...field,
              order: field.order ?? index,
            },
          })
        )
      );

      return NextResponse.json(created);
    }

    const data = fieldSchema.parse(body);
    const maxOrder = await prisma.formField.findFirst({
      where: { formId: params.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const field = await prisma.formField.create({
      data: {
        formId: params.id,
        ...data,
        order: data.order ?? (maxOrder?.order ?? -1) + 1,
      },
    });

    return NextResponse.json(field);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
