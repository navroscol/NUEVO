import QRCode from "qrcode";

export function buildWhatsAppUrl(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const base = `https://wa.me/${cleanPhone}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

export async function generateQRDataURL(
  text: string,
  options?: {
    color?: string;
    bgColor?: string;
    width?: number;
  }
): Promise<string> {
  const { color = "#25D366", bgColor = "#FFFFFF", width = 300 } = options ?? {};

  return QRCode.toDataURL(text, {
    width,
    margin: 2,
    color: {
      dark: color,
      light: bgColor,
    },
    errorCorrectionLevel: "M",
  });
}

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}
