import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [
    totalForms,
    totalTemplates,
    totalSubmissions,
    totalDocuments,
    pendingSubmissions,
    approvedSubmissions,
    totalUsers,
    totalEntities,
  ] = await Promise.all([
    prisma.form.count(),
    prisma.template.count(),
    prisma.submission.count(),
    prisma.document.count(),
    prisma.submission.count({ where: { status: { in: ["SUBMITTED", "VERIFIED"] } } }),
    prisma.submission.count({ where: { status: { in: ["APPROVED", "COMPLETED"] } } }),
    prisma.user.count(),
    prisma.entity.count(),
  ]);

  return NextResponse.json({
    totalForms,
    totalTemplates,
    totalSubmissions,
    totalDocuments,
    pendingSubmissions,
    approvedSubmissions,
    totalUsers,
    totalEntities,
  });
}
