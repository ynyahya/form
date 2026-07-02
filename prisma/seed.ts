import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@formflow.go.id" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@formflow.go.id",
      hashedPassword,
      role: "SUPER_ADMIN",
      instansi: "Badan Pusat Statistik",
      unitKerja: "IT",
      jabatan: "Administrator Sistem",
    },
  });

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@formflow.go.id" },
    update: {},
    create: {
      name: "Admin Utama",
      email: "admin@formflow.go.id",
      hashedPassword,
      role: "ADMIN",
      instansi: "Badan Pusat Statistik",
      unitKerja: "Bagian Umum",
      jabatan: "Kepala Bagian",
    },
  });

  // Create Petugas
  const petugas = await prisma.user.upsert({
    where: { email: "petugas@formflow.go.id" },
    update: {},
    create: {
      name: "Petugas Lapangan",
      email: "petugas@formflow.go.id",
      hashedPassword,
      role: "PETUGAS",
      instansi: "Badan Pusat Statistik",
      unitKerja: "Seksi Sosial",
      jabatan: "Pengumpul Data",
    },
  });

  // Create Entity: Petugas
  const petugasEntity = await prisma.entity.upsert({
    where: { slug: "petugas" },
    update: {},
    create: {
      name: "Petugas",
      slug: "petugas",
      description: "Data master petugas lapangan",
      fields: {
        create: [
          { name: "Nama", slug: "nama", type: "text", required: true, order: 0 },
          { name: "NIK", slug: "nik", type: "text", required: true, order: 1 },
          { name: "NIP", slug: "nip", type: "text", required: false, order: 2 },
          { name: "Jabatan", slug: "jabatan", type: "text", required: false, order: 3 },
          { name: "Pangkat/Golongan", slug: "pangkat_golongan", type: "text", required: false, order: 4 },
          { name: "Unit Kerja", slug: "unit_kerja", type: "text", required: false, order: 5 },
          { name: "No. Rekening", slug: "no_rekening", type: "text", required: false, order: 6 },
          { name: "Bank", slug: "bank", type: "text", required: false, order: 7 },
          { name: "No. HP", slug: "no_hp", type: "phone", required: false, order: 8 },
        ],
      },
    },
  });

  // Create Entity: Kegiatan
  const kegiatanEntity = await prisma.entity.upsert({
    where: { slug: "kegiatan" },
    update: {},
    create: {
      name: "Kegiatan",
      slug: "kegiatan",
      description: "Data master kegiatan statistik",
      fields: {
        create: [
          { name: "Nama Kegiatan", slug: "nama_kegiatan", type: "text", required: true, order: 0 },
          { name: "Kode Kegiatan", slug: "kode_kegiatan", type: "text", required: true, order: 1 },
          { name: "Tahun", slug: "tahun", type: "number", required: true, order: 2 },
          { name: "Tanggal Mulai", slug: "tanggal_mulai", type: "date", required: false, order: 3 },
          { name: "Tanggal Selesai", slug: "tanggal_selesai", type: "date", required: false, order: 4 },
          { name: "Anggaran", slug: "anggaran", type: "currency", required: false, order: 5 },
        ],
      },
    },
  });

  // Create a sample Form
  const form = await prisma.form.upsert({
    where: { slug: "spj-honor-petugas" },
    update: {},
    create: {
      title: "SPJ Honor Petugas",
      description: "Form SPJ untuk pembayaran honor petugas lapangan. Satu form menghasilkan Daftar Hadir, Kwitansi, dan SPJ.",
      slug: "spj-honor-petugas",
      status: "PUBLISHED",
      createdById: admin.id,
      fields: {
        create: [
          { name: "Nama Kegiatan", slug: "nama_kegiatan", type: "text", label: "Nama Kegiatan", required: true, width: "full", order: 0 },
          { name: "Tanggal", slug: "tanggal", type: "date", label: "Tanggal Pelaksanaan", required: true, width: "half", order: 1 },
          { name: "Lokasi", slug: "lokasi", type: "text", label: "Lokasi", required: true, width: "half", order: 2 },
          { name: "Section Peserta", slug: "section_peserta", type: "section", label: "Data Peserta", width: "full", order: 3 },
          { name: "Nama Peserta", slug: "nama_peserta", type: "nama_pegawai", label: "Nama Peserta", required: true, width: "half", order: 4 },
          { name: "NIK", slug: "nik", type: "nik", label: "NIK", required: true, width: "half", order: 5 },
          { name: "Jabatan", slug: "jabatan", type: "jabatan", label: "Jabatan", width: "half", order: 6 },
          { name: "Golongan", slug: "golongan", type: "golongan", label: "Golongan", width: "half", order: 7 },
          { name: "Section Pembayaran", slug: "section_pembayaran", type: "section", label: "Data Pembayaran", width: "full", order: 8 },
          { name: "Honor Harian", slug: "honor_harian", type: "honor", label: "Honor Harian", required: true, width: "half", order: 9 },
          { name: "Jumlah Hari", slug: "jumlah_hari", type: "number", label: "Jumlah Hari", required: true, width: "half", order: 10 },
          { name: "Transport", slug: "transport", type: "transport", label: "Transport", width: "half", order: 11 },
          { name: "Uang Harian", slug: "uang_harian", type: "uang_harian", label: "Uang Harian", width: "half", order: 12 },
          { name: "Total Honor", slug: "total_honor", type: "formula", label: "Total Honor", formula: "honor_harian * jumlah_hari", width: "half", order: 13 },
          { name: "Total Pembayaran", slug: "total_pembayaran", type: "formula", label: "Total Pembayaran", formula: "honor_harian * jumlah_hari + transport + uang_harian", width: "half", order: 14 },
          { name: "Terbilang", slug: "terbilang_total", type: "terbilang", label: "Terbilang", formula: "total_pembayaran", width: "full", order: 15 },
          { name: "Tanda Tangan", slug: "tanda_tangan", type: "signature", label: "Tanda Tangan", width: "half", order: 16 },
        ],
      },
    },
  });

  // Create templates for the form
  await prisma.template.upsert({
    where: { id: "template-daftar-hadir" },
    update: {},
    create: {
      id: "template-daftar-hadir",
      formId: form.id,
      name: "Daftar Hadir",
      description: "Template daftar hadir peserta kegiatan",
      type: "PDF",
      pageSize: "A4",
      orientation: "portrait",
      body: {
        elements: [
          { id: "1", type: "text", content: "DAFTAR HADIR", x: 150, y: 20, width: 300, height: 30, style: { fontSize: 18, fontWeight: "bold", textAlign: "center" } },
          { id: "2", type: "text", content: "Kegiatan: {{nama_kegiatan}}", x: 20, y: 60, width: 400, height: 24, style: { fontSize: 12 } },
          { id: "3", type: "text", content: "Tanggal: {{tanggal}}", x: 20, y: 85, width: 300, height: 24, style: { fontSize: 12 } },
          { id: "4", type: "text", content: "Lokasi: {{lokasi}}", x: 20, y: 110, width: 300, height: 24, style: { fontSize: 12 } },
          { id: "5", type: "table", x: 20, y: 150, width: 555, height: 120, columns: [{ label: "No", fieldSlug: "no", width: 40 }, { label: "Nama", fieldSlug: "nama_peserta", width: 200 }, { label: "Jabatan", fieldSlug: "jabatan", width: 150 }, { label: "Tanda Tangan", fieldSlug: "tanda_tangan", width: 150 }] },
        ],
      },
    },
  });

  await prisma.template.upsert({
    where: { id: "template-kwitansi" },
    update: {},
    create: {
      id: "template-kwitansi",
      formId: form.id,
      name: "Kwitansi",
      description: "Template kwitansi pembayaran honor",
      type: "PDF",
      pageSize: "A4",
      orientation: "portrait",
      body: {
        elements: [
          { id: "1", type: "text", content: "KWITANSI", x: 200, y: 20, width: 200, height: 30, style: { fontSize: 18, fontWeight: "bold", textAlign: "center" } },
          { id: "2", type: "text", content: "Sudah Terima dari: Bendahara", x: 20, y: 70, width: 400, height: 24, style: { fontSize: 12 } },
          { id: "3", type: "field", fieldSlug: "nama_peserta", x: 20, y: 100, width: 400, height: 24 },
          { id: "4", type: "text", content: "Uang Sejumlah:", x: 20, y: 130, width: 200, height: 24, style: { fontSize: 12 } },
          { id: "5", type: "field", fieldSlug: "total_pembayaran", x: 220, y: 130, width: 200, height: 24 },
          { id: "6", type: "text", content: "Terbilang:", x: 20, y: 160, width: 100, height: 24, style: { fontSize: 12 } },
          { id: "7", type: "field", fieldSlug: "terbilang_total", x: 120, y: 160, width: 400, height: 24 },
          { id: "8", type: "signature", x: 380, y: 220, width: 150, height: 80 },
        ],
      },
    },
  });

  await prisma.template.upsert({
    where: { id: "template-spj" },
    update: {},
    create: {
      id: "template-spj",
      formId: form.id,
      name: "SPJ Honor",
      description: "Surat Pertanggungjawaban pembayaran honor petugas",
      type: "PDF",
      pageSize: "A4",
      orientation: "landscape",
      body: {
        elements: [
          { id: "1", type: "text", content: "SURAT PERTANGGUNGJAWABAN (SPJ)", x: 200, y: 20, width: 400, height: 30, style: { fontSize: 16, fontWeight: "bold", textAlign: "center" } },
          { id: "2", type: "text", content: "PEMBAYARAN HONOR PETUGAS", x: 200, y: 50, width: 400, height: 24, style: { fontSize: 14, fontWeight: "bold", textAlign: "center" } },
          { id: "3", type: "text", content: "Kegiatan: {{nama_kegiatan}}", x: 20, y: 90, width: 400, height: 24, style: { fontSize: 12 } },
          { id: "4", type: "table", x: 20, y: 130, width: 750, height: 150, columns: [{ label: "No", fieldSlug: "no", width: 40 }, { label: "Nama", fieldSlug: "nama_peserta", width: 150 }, { label: "NIK", fieldSlug: "nik", width: 120 }, { label: "Jabatan", fieldSlug: "jabatan", width: 100 }, { label: "Honor/Hari", fieldSlug: "honor_harian", width: 100 }, { label: "Jml Hari", fieldSlug: "jumlah_hari", width: 60 }, { label: "Total", fieldSlug: "total_honor", width: 100 }, { label: "TTD", fieldSlug: "tanda_tangan", width: 80 }] },
        ],
      },
    },
  });

  console.log("Seed completed:");
  console.log(`  Users: ${superAdmin.name}, ${admin.name}, ${petugas.name}`);
  console.log(`  Entities: ${petugasEntity.name}, ${kegiatanEntity.name}`);
  console.log(`  Form: ${form.title} (with 3 templates)`);
  console.log("\nLogin credentials:");
  console.log("  Email: superadmin@formflow.go.id / admin@formflow.go.id / petugas@formflow.go.id");
  console.log("  Password: admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
