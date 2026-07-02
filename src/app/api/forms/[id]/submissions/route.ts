import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const submissionSchema = z.object({
  data: z.record(z.any()),
  status: z.enum(["DRAFT", "SUBMITTED"]).optional(),
  signatures: z.any().optional(),
  attachments: z.any().optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const submissions = await prisma.submission.findMany({
    where: { formId: params.id },
    include: {
      user: { select: { name: true, email: true } },
      documents: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(submissions);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = submissionSchema.parse(body);

    const submission = await prisma.submission.create({
      data: {
        formId: params.id,
        submittedBy: session.user.id,
        data: data.data,
        status: data.status || "DRAFT",
        signatures: data.signatures,
        attachments: data.attachments,
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
