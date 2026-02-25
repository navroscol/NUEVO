"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Scan {
  id: string;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  createdAt: string;
}

interface QRCode {
  id: string;
  name: string;
  slug: string;
  phone: string;
  message?: string;
  webhookUrl?: string;
  webhookNote?: string;
  color: string;
  bgColor: string;
  active: boolean;
  totalScans: number;
  createdAt: string;
  updatedAt: string;
  scans: Scan[];
}

export default function QRDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [qr, setQr] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [trackUrl, setTrackUrl] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<QRCode>>({});
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/qrcodes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setQr(data);
        setEditForm(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!qr) return;
    fetch(`/api/qr-image/${qr.id}?size=400`)
      .then((r) => r.json())
      .then((data) => {
        setQrImage(data.dataUrl);
        setTrackUrl(data.trackUrl);
      });
  }, [qr]);

  async function handleSave() {
    if (!qr) return;
    setSaving(true);
    const res = await fetch(`/api/qrcodes/${qr.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const updated = await res.json();
    setQr((prev) => ({ ...prev!, ...updated }));
    setEditing(false);
    setSaving(false);
    // Reload QR image
    fetch(`/api/qr-image/${qr.id}?size=400`)
      .then((r) => r.json())
      .then((data) => {
        setQrImage(data.dataUrl);
        setTrackUrl(data.trackUrl);
      });
  }

  async function handleDelete() {
    if (!qr || !confirm("¿Eliminar este QR code permanentemente?")) return;
    await fetch(`/api/qrcodes/${qr.id}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  function handleDownload() {
    if (!qrImage) return;
    const a = document.createElement("a");
    a.href = qrImage;
    a.download = `qr-${qr?.slug ?? "code"}.png`;
    a.click();
  }

  function handleCopy() {
    if (!trackUrl) return;
    navigator.clipboard.writeText(trackUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function getDeviceType(ua?: string): string {
    if (!ua) return "Desconocido";
    if (/iPhone|iPad|Android/i.test(ua)) return "Móvil";
    return "Desktop";
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!qr) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">QR code no encontrado.</p>
        <Link href="/dashboard" className="text-[#25D366] underline mt-2 inline-block">
          Volver al dashboard
        </Link>
      </div>
    );
  }

  // Analytics: scans by day (last 7)
  const scansByDay: Record<string, number> = {};
  qr.scans.forEach((s) => {
    const day = new Date(s.createdAt).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
    scansByDay[day] = (scansByDay[day] || 0) + 1;
  });
  const maxScans = Math.max(...Object.values(scansByDay), 1);

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="hover:text-gray-600 transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{qr.name}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: QR + info */}
        <div className="xl:col-span-1 space-y-6">
          {/* QR Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-bold text-gray-900 text-lg">{qr.name}</h1>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  qr.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {qr.active ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div
              className="w-full aspect-square rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: qr.bgColor }}
            >
              {qrImage ? (
                <img src={qrImage} alt={qr.name} className="w-full h-full object-contain p-4" />
              ) : (
                <div className="w-8 h-8 border-4 border-gray-300 border-t-[#25D366] rounded-full animate-spin" />
              )}
            </div>

            {/* Track URL */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-400 mb-1">URL de tracking:</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-700 truncate flex-1 font-mono">{trackUrl}</p>
                <button
                  onClick={handleCopy}
                  className="text-xs text-[#25D366] font-medium flex-shrink-0"
                >
                  {copied ? "¡Copiado!" : "Copiar"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownload}
                disabled={!qrImage}
                className="gradient-wa text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar
              </button>
              <button
                onClick={() => setEditing(!editing)}
                className="border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {editing ? "Cancelar" : "Editar"}
              </button>
            </div>
          </div>

          {/* Config summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h2 className="font-semibold text-gray-900 mb-4">Configuración</h2>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Teléfono</p>
              <p className="text-sm font-medium text-gray-800">+{qr.phone.replace(/\D/g, "")}</p>
            </div>
            {qr.message && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Mensaje</p>
                <p className="text-sm text-gray-700 bg-green-50 rounded-lg px-3 py-2">&quot;{qr.message}&quot;</p>
              </div>
            )}
            {qr.webhookUrl && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">n8n Webhook</p>
                <p className="text-xs text-purple-600 font-mono bg-purple-50 rounded-lg px-3 py-2 break-all">
                  {qr.webhookUrl}
                </p>
                {qr.webhookNote && (
                  <p className="text-xs text-gray-500 mt-1">{qr.webhookNote}</p>
                )}
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Creado</p>
              <p className="text-sm text-gray-700">{formatDate(qr.createdAt)}</p>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
            <h2 className="font-semibold text-red-600 mb-3">Zona peligrosa</h2>
            <button
              onClick={handleDelete}
              className="w-full border border-red-200 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Eliminar QR Code
            </button>
          </div>
        </div>

        {/* Right: Analytics + Edit */}
        <div className="xl:col-span-2 space-y-6">
          {/* Edit form */}
          {editing && (
            <div className="bg-white rounded-2xl border border-[#25D366] shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-5">Editar QR Code</h2>
              <div className="space-y-4">
                {[
                  { label: "Nombre", key: "name", type: "text", required: true },
                  { label: "Teléfono", key: "phone", type: "text", required: true },
                  { label: "Mensaje", key: "message", type: "text" },
                  { label: "Webhook n8n", key: "webhookUrl", type: "url" },
                  { label: "Nota webhook", key: "webhookNote", type: "text" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={(editForm[field.key as keyof QRCode] as string) ?? ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                    />
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="gradient-wa text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Escaneos", value: qr.totalScans, icon: "📊" },
              {
                label: "Dispositivos móviles",
                value: qr.scans.filter((s) => getDeviceType(s.userAgent) === "Móvil").length,
                icon: "📱",
              },
              {
                label: "Última semana",
                value: qr.scans.filter(
                  (s) =>
                    new Date(s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length,
                icon: "📅",
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          {Object.keys(scansByDay).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-5">Escaneos por día</h2>
              <div className="flex items-end gap-2 h-32">
                {Object.entries(scansByDay).slice(-10).map(([day, count]) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 font-medium">{count}</span>
                    <div
                      className="w-full rounded-t-md transition-all"
                      style={{
                        height: `${(count / maxScans) * 80}px`,
                        backgroundColor: qr.color,
                        minHeight: "4px",
                      }}
                    />
                    <span className="text-xs text-gray-400 rotate-45 origin-left whitespace-nowrap text-[10px]">
                      {day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scan log */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">
              Historial de escaneos
              <span className="ml-2 text-xs font-normal text-gray-400">
                (últimos {qr.scans.length})
              </span>
            </h2>

            {qr.scans.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-400 text-sm">Aún no hay escaneos registrados</p>
                <p className="text-gray-400 text-xs mt-1">
                  Imprime o comparte el QR para empezar a recibir datos
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Fecha
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Dispositivo
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        IP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {qr.scans.map((scan) => (
                      <tr key={scan.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-gray-700">
                          {formatDate(scan.createdAt)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              getDeviceType(scan.userAgent) === "Móvil"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {getDeviceType(scan.userAgent)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-400 font-mono text-xs">
                          {scan.ip ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
