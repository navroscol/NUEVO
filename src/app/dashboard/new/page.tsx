"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const PRESET_COLORS = [
  "#25D366", // WhatsApp green
  "#128C7E", // WhatsApp dark green
  "#075E54", // WhatsApp darker
  "#2563EB", // Blue
  "#7C3AED", // Purple
  "#DC2626", // Red
  "#EA580C", // Orange
  "#000000", // Black
];

export default function NewQRPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    message: "",
    webhookUrl: "",
    webhookNote: "",
    color: "#25D366",
    bgColor: "#FFFFFF",
  });

  // Live preview debounce
  useEffect(() => {
    if (!form.phone) {
      setPreview(null);
      return;
    }
    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const { generateQRDataURL, buildWhatsAppUrl } = await import("@/lib/qr");
        const url = buildWhatsAppUrl(form.phone, form.message);
        const dataUrl = await generateQRDataURL(url, {
          color: form.color,
          bgColor: form.bgColor,
          width: 240,
        });
        setPreview(dataUrl);
      } catch {
        setPreview(null);
      }
      setPreviewLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [form.phone, form.message, form.color, form.bgColor]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setLoading(true);
    try {
      const res = await fetch("/api/qrcodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/dashboard/${data.id}`);
      } else {
        alert(data.error || "Error al crear el QR code");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo QR Code</h1>
        <p className="text-gray-500 text-sm mt-1">
          Configura tu QR de WhatsApp y conéctalo a n8n
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-bold">1</span>
              Información básica
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nombre del QR Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="ej: Campaña Verano 2025"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Número de WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+</span>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="5491112345678"
                    required
                    className="w-full border border-gray-200 rounded-lg pl-6 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Incluye código de país sin + (ej: 5491112345678 para Argentina)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mensaje pre-llenado (opcional)
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Hola! Quiero más información sobre..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Este mensaje aparecerá pre-escrito cuando el usuario abra WhatsApp
                </p>
              </div>
            </div>
          </div>

          {/* n8n integration */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-bold">2</span>
              Integración n8n (opcional)
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Webhook URL de n8n
                </label>
                <input
                  type="url"
                  name="webhookUrl"
                  value={form.webhookUrl}
                  onChange={handleChange}
                  placeholder="https://tu-n8n.app/webhook/abc123"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Cada vez que alguien escanee el QR, se enviará un POST a este URL
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nota del webhook (opcional)
                </label>
                <input
                  type="text"
                  name="webhookNote"
                  value={form.webhookNote}
                  onChange={handleChange}
                  placeholder="ej: Lead desde stand ferial"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                />
              </div>

              {/* Payload preview */}
              <div className="bg-gray-900 rounded-xl p-4 text-xs text-green-400 font-mono overflow-auto">
                <p className="text-gray-400 mb-2">// Payload que recibirá n8n:</p>
                <pre>{`{
  "event": "qr_scan",
  "qrName": "${form.name || "Mi QR Code"}",
  "phone": "${form.phone || "5491112345678"}",
  "message": "${form.message || "Hola!"}",
  "scannedAt": "2025-03-01T10:00:00Z",
  "ip": "...",
  "userAgent": "..."
}`}</pre>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-bold">3</span>
              Personalización
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color del QR
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, color: c }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        form.color === c ? "border-gray-800 scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                    title="Color personalizado"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de fondo
                </label>
                <div className="flex items-center gap-3">
                  {["#FFFFFF", "#F0FFF4", "#EFF6FF", "#FFF7ED"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, bgColor: c }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        form.bgColor === c ? "border-gray-800 scale-110" : "border-gray-200"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={form.bgColor}
                    onChange={(e) => setForm((prev) => ({ ...prev, bgColor: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                    title="Color de fondo personalizado"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !form.name || !form.phone}
            className="w-full gradient-wa text-white py-3.5 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando QR Code..." : "Crear QR Code"}
          </button>
        </form>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-5 text-center">
                Vista previa
              </h2>

              <div
                className="w-full aspect-square rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200 mb-4"
                style={{ backgroundColor: form.bgColor }}
              >
                {previewLoading ? (
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-[#25D366] rounded-full animate-spin" />
                ) : preview ? (
                  <img src={preview} alt="QR Preview" className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-2">🔲</div>
                    <p className="text-sm">Ingresa el número para ver la vista previa</p>
                  </div>
                )}
              </div>

              {form.phone && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg viewBox="0 0 24 24" fill="#25D366" className="w-4 h-4 flex-shrink-0">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span className="truncate">+{form.phone.replace(/\D/g, "")}</span>
                  </div>
                  {form.message && (
                    <div className="bg-green-50 rounded-lg px-3 py-2 text-green-800 text-xs">
                      &quot;{form.message}&quot;
                    </div>
                  )}
                  {form.webhookUrl && (
                    <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      n8n webhook configurado
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
