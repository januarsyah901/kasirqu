import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = productSchema.parse(body);

    const {
      name,
      categoryId,
      unit: saleUnit,
      baseUnit,
      unitsPerSale,
      buyPrice, // per saleUnit
      sellPrice, // per saleUnit
      stock, // in saleUnit
      minStock,
      imageUrl,
    } = validated;

    // Convert to base unit (the unit we store for stock/price)
    const stockBase = Number(stock) * Number(unitsPerSale);
    const buyPriceBase = Number(buyPrice) / Number(unitsPerSale); // per baseUnit
    const sellPriceBase = Number(sellPrice) / Number(unitsPerSale); // per baseUnit

    const product = await db.product.create({
      data: {
        name,
        categoryId,
        unit: saleUnit, // keep sale unit for display
        baseUnit,
        unitsPerSale: Number(unitsPerSale),
        buyPrice: buyPriceBase,
        sellPrice: sellPriceBase,
        stock: stockBase,
        minStock: Number(minStock),
        imageUrl,
      },
      include: { category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}