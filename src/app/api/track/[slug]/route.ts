import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const qrcode = await prisma.qRCode.findUnique({ where: { slug } });

  if (!qrcode || !qrcode.active) {
    return NextResponse.json({ error: "QR not found or inactive" }, { status: 404 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    null;
  const userAgent = req.headers.get("user-agent") || null;
  const referrer = req.headers.get("referer") || null;

  await prisma.$transaction([
    prisma.scan.create({
      data: {
        qrCodeId: qrcode.id,
        ip,
        userAgent,
        referrer,
      },
    }),
    prisma.qRCode.update({
      where: { id: qrcode.id },
      data: { totalScans: { increment: 1 } },
    }),
  ]);

  // Fire n8n webhook in background (non-blocking)
  if (qrcode.webhookUrl) {
    const webhookPayload = {
      event: "qr_scan",
      qrId: qrcode.id,
      qrName: qrcode.name,
      slug: qrcode.slug,
      phone: qrcode.phone,
      message: qrcode.message,
      scannedAt: new Date().toISOString(),
      ip,
      userAgent,
    };

    fetch(qrcode.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload),
    }).catch(() => {
      // Silently ignore webhook errors
    });
  }

  // Build WhatsApp redirect URL
  const cleanPhone = qrcode.phone.replace(/\D/g, "");
  const waUrl = qrcode.message
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(qrcode.message)}`
    : `https://wa.me/${cleanPhone}`;

  return NextResponse.redirect(waUrl);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  return GET(req, { params });
}
