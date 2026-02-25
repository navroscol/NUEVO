import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQRDataURL } from "@/lib/qr";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const width = parseInt(searchParams.get("size") || "400");

  const qrcode = await prisma.qRCode.findUnique({ where: { id } });
  if (!qrcode) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const trackUrl = `${baseUrl}/api/track/${qrcode.slug}`;

  const dataUrl = await generateQRDataURL(trackUrl, {
    color: qrcode.color,
    bgColor: qrcode.bgColor,
    width: Math.min(Math.max(width, 100), 1000),
  });

  // Return base64 data URL as JSON
  return NextResponse.json({ dataUrl, trackUrl });
}
