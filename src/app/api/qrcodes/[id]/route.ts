import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const qrcode = await prisma.qRCode.findUnique({
    where: { id },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!qrcode) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(qrcode);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, phone, message, webhookUrl, webhookNote, color, bgColor, active } = body;

  const qrcode = await prisma.qRCode.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(message !== undefined && { message }),
      ...(webhookUrl !== undefined && { webhookUrl }),
      ...(webhookNote !== undefined && { webhookNote }),
      ...(color !== undefined && { color }),
      ...(bgColor !== undefined && { bgColor }),
      ...(active !== undefined && { active }),
    },
  });

  return NextResponse.json(qrcode);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.qRCode.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
