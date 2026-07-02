"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileStack, Send, CheckCircle, Clock, Users, Database, AlertCircle } from "lucide-react";

interface DashboardStats {
  totalForms: number;
  totalTemplates: number;
  totalSubmissions: number;
  totalDocuments: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  totalUsers: number;
  totalEntities: number;
}

export default function DashboardPage() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      return res.json();
    },
  });

  const cards = [
    { title: "Total Form", value: stats?.totalForms ?? 0, icon: FileText, color: "bg-blue-500" },
    { title: "Total Template", value: stats?.totalTemplates ?? 0, icon: FileStack, color: "bg-purple-500" },
    { title: "Total Submission", value: stats?.totalSubmissions ?? 0, icon: Send, color: "bg-green-500" },
    { title: "Dokumen Dihasilkan", value: stats?.totalDocuments ?? 0, icon: CheckCircle, color: "bg-emerald-500" },
    { title: "Menunggu Persetujuan", value: stats?.pendingSubmissions ?? 0, icon: Clock, color: "bg-yellow-500" },
    { title: "Sudah Disetujui", value: stats?.approvedSubmissions ?? 0, icon: AlertCircle, color: "bg-teal-500" },
    { title: "Total Pengguna", value: stats?.totalUsers ?? 0, icon: Users, color: "bg-indigo-500" },
    { title: "Total Entitas", value: stats?.totalEntities ?? 0, icon: Database, color: "bg-pink-500" },
  ];

  return (
    <div>
      <Header title="Dashboard" description="Ringkasan sistem FormFlow Government" />
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">{card.title}</CardTitle>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Belum ada aktivitas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Form Terpopuler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Belum ada form</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
