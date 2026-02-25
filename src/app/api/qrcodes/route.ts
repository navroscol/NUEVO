import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/qr";

export async function GET() {
  const qrcodes = await prisma.qRCode.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { scans: true } },
    },
  });
  return NextResponse.json(qrcodes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, message, webhookUrl, webhookNote, color, bgColor } = body;

  if (!name || !phone) {
    return NextResponse.json(
      { error: "name and phone are required" },
      { status: 400 }
    );
  }

  const slug = generateSlug(name);

  const qrcode = await prisma.qRCode.create({
    data: {
      name,
      slug,
      phone,
      message: message || null,
      webhookUrl: webhookUrl || null,
      webhookNote: webhookNote || null,
      color: color || "#25D366",
      bgColor: bgColor || "#FFFFFF",
    },
  });

  return NextResponse.json(qrcode, { status: 201 });
}
