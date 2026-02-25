import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export default async function QRRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const qrcode = await prisma.qRCode.findUnique({ where: { slug } });

  if (!qrcode || !qrcode.active) {
    redirect("/");
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    null;
  const userAgent = headersList.get("user-agent") || null;
  const referrer = headersList.get("referer") || null;

  await prisma.$transaction([
    prisma.scan.create({
      data: { qrCodeId: qrcode.id, ip, userAgent, referrer },
    }),
    prisma.qRCode.update({
      where: { id: qrcode.id },
      data: { totalScans: { increment: 1 } },
    }),
  ]);

  // Fire n8n webhook async (best effort)
  if (qrcode.webhookUrl) {
    const payload = {
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
    // Use void to not await
    void fetch(qrcode.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  const cleanPhone = qrcode.phone.replace(/\D/g, "");
  const waUrl = qrcode.message
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(qrcode.message)}`
    : `https://wa.me/${cleanPhone}`;

  redirect(waUrl);
}
