"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface QRCode {
  id: string;
  name: string;
  slug: string;
  phone: string;
  message?: string;
  webhookUrl?: string;
  color: string;
  bgColor: string;
  active: boolean;
  totalScans: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [qrcodes, setQrcodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/qrcodes")
      .then((r) => r.json())
      .then((data) => {
        setQrcodes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que quieres eliminar este QR code?")) return;
    await fetch(`/api/qrcodes/${id}`, { method: "DELETE" });
    setQrcodes((prev) => prev.filter((qr) => qr.id !== id));
  }

  async function handleToggle(id: string, active: boolean) {
    const res = await fetch(`/api/qrcodes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    const updated = await res.json();
    setQrcodes((prev) => prev.map((qr) => (qr.id === id ? { ...qr, active: updated.active } : qr)));
  }

  const totalScans = qrcodes.reduce((sum, qr) => sum + qr.totalScans, 0);
  const activeCount = qrcodes.filter((qr) => qr.active).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis QR Codes</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestiona tus QR codes de WhatsApp conectados a n8n
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="gradient-wa text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo QR Code
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total QR Codes", value: qrcodes.length, icon: "🔲" },
          { label: "QR Activos", value: activeCount, icon: "✅" },
          { label: "Escaneos Totales", value: totalScans, icon: "📊" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : qrcodes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-6xl mb-4">🔲</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No tienes QR codes todavía</h2>
          <p className="text-gray-500 mb-6">
            Crea tu primer QR code para WhatsApp y conéctalo a n8n
          </p>
          <Link
            href="/dashboard/new"
            className="gradient-wa text-white px-6 py-3 rounded-lg font-medium inline-block hover:opacity-90 transition-opacity"
          >
            Crear primer QR Code
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {qrcodes.map((qr) => (
            <QRCard
              key={qr.id}
              qr={qr}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QRCard({
  qr,
  onDelete,
  onToggle,
}: {
  qr: QRCode;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
}) {
  const [qrImage, setQrImage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/qr-image/${qr.id}?size=120`)
      .then((r) => r.json())
      .then((data) => setQrImage(data.dataUrl))
      .catch(() => {});
  }, [qr.id, qr.color, qr.bgColor]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden card-hover">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{qr.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">+{qr.phone.replace(/\D/g, "")}</p>
          </div>
          <span
            className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
              qr.active
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {qr.active ? "Activo" : "Inactivo"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {qrImage ? (
            <img
              src={qrImage}
              alt={`QR ${qr.name}`}
              className="w-20 h-20 rounded-lg border border-gray-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gray-100 animate-pulse" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-gray-900">{qr.totalScans}</span>
              <span className="text-sm text-gray-500">escaneos</span>
            </div>
            {qr.webhookUrl && (
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                n8n conectado
              </div>
            )}
            {qr.message && (
              <p className="text-xs text-gray-400 mt-1 truncate">
                &quot;{qr.message}&quot;
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50">
        <div className="flex gap-2">
          <Link
            href={`/dashboard/${qr.id}`}
            className="text-xs text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 rounded-md hover:bg-white transition-colors border border-gray-200"
          >
            Ver detalles
          </Link>
          <button
            onClick={() => onToggle(qr.id, qr.active)}
            className="text-xs text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 rounded-md hover:bg-white transition-colors border border-gray-200"
          >
            {qr.active ? "Desactivar" : "Activar"}
          </button>
        </div>
        <button
          onClick={() => onDelete(qr.id)}
          className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1.5 rounded-md hover:bg-red-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
