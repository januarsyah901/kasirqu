import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import ExcelJS from "exceljs";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "transactions";

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Kasir Sembako";
  workbook.created = new Date();

  const formatRupiah = (val: number | string | null | undefined) => {
    const num = Number(val ?? 0);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const addHeaderStyle = (ws: ExcelJS.Worksheet) => {
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF5F5F5" },
    };
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });
  };

  switch (type) {
    case "products": {
      const ws = workbook.addWorksheet("Produk");
      ws.columns = [
        { header: "Nama", key: "name", width: 30 },
        { header: "Kategori", key: "category", width: 20 },
        { header: "Satuan", key: "unit", width: 10 },
        { header: "Harga Beli", key: "buyPrice", width: 15 },
        { header: "Harga Jual", key: "sellPrice", width: 15 },
        { header: "Stok", key: "stock", width: 10 },
        { header: "Min Stok", key: "minStock", width: 10 },
      ];
      addHeaderStyle(ws);

      const products = await db.product.findMany({
        include: { category: true },
        orderBy: { name: "asc" },
      });

      products.forEach((p) => {
        ws.addRow({
          name: p.name,
          category: p.category.name,
          unit: p.unit,
          buyPrice: formatRupiah(Number(p.buyPrice)),
          sellPrice: formatRupiah(Number(p.sellPrice)),
          stock: Number(p.stock),
          minStock: Number(p.minStock),
        });
      });
      break;
    }

    case "transactions": {
      const ws = workbook.addWorksheet("Transaksi");
      ws.columns = [
        { header: "Invoice", key: "invoice", width: 22 },
        { header: "Total", key: "total", width: 15 },
        { header: "Diskon", key: "discount", width: 12 },
        { header: "Bayar", key: "paid", width: 15 },
        { header: "Kembali", key: "change", width: 15 },
        { header: "Status", key: "status", width: 12 },
        { header: "Tanggal", key: "date", width: 20 },
        { header: "Item", key: "items", width: 50 },
      ];
      addHeaderStyle(ws);

      const transactions = await db.transaction.findMany({
        include: {
          items: {
            include: { product: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 500,
      });

      transactions.forEach((tx) => {
        ws.addRow({
          invoice: tx.invoiceNumber,
          total: formatRupiah(Number(tx.total)),
          discount: formatRupiah(Number(tx.discount)),
          paid: formatRupiah(Number(tx.paidAmount)),
          change: formatRupiah(Number(tx.changeAmount)),
          status: tx.status === "COMPLETED" ? "Selesai" : "Void",
          date: tx.createdAt.toLocaleString("id-ID"),
          items: tx.items.map((i) => `${i.product.name} x${i.quantity}`).join(", "),
        });
      });
      break;
    }

    case "debts": {
      const ws = workbook.addWorksheet("Utang");
      ws.columns = [
        { header: "Pelanggan", key: "customer", width: 25 },
        { header: "No. HP", key: "phone", width: 15 },
        { header: "Total Utang", key: "amount", width: 15 },
        { header: "Dibayar", key: "paid", width: 15 },
        { header: "Sisa", key: "remaining", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "Catatan", key: "note", width: 30 },
        { header: "Tanggal", key: "date", width: 20 },
      ];
      addHeaderStyle(ws);

      const debts = await db.debt.findMany({
        orderBy: { createdAt: "desc" },
      });

      debts.forEach((d) => {
        const remaining = Number(d.amount) - Number(d.paidAmount);
        ws.addRow({
          customer: d.customerName,
          phone: d.customerPhone || "-",
          amount: formatRupiah(Number(d.amount)),
          paid: formatRupiah(Number(d.paidAmount)),
          remaining: formatRupiah(remaining),
          status:
            d.status === "PAID" ? "Lunas" : d.status === "PARTIAL" ? "Angsuran" : "Belum Dibayar",
          note: d.note || "-",
          date: d.createdAt.toLocaleString("id-ID"),
        });
      });
      break;
    }

    default:
      return NextResponse.json({ error: "Tipe tidak valid" }, { status: 400 });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="export-${type}-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}