import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-wa flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <span className="font-bold text-xl text-gray-900">QRConnect</span>
        </div>
        <Link
          href="/dashboard"
          className="bg-[#25D366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#128C7E] transition-colors"
        >
          Ir al Dashboard
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
          WhatsApp + n8n Automations
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          QR Codes que disparan{" "}
          <span className="text-[#25D366]">automatizaciones</span>{" "}
          en tiempo real
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Crea QR codes escaneables para WhatsApp vinculados a tus flujos de n8n.
          Cada escaneo registra analytics y dispara tu webhook automáticamente.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/dashboard/new"
            className="gradient-wa text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            Crear QR Code Gratis
          </Link>
          <Link
            href="/dashboard"
            className="border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors"
          >
            Ver Dashboard
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Crea tu QR Code",
                desc: "Configura el número de WhatsApp, mensaje pre-llenado y el webhook de n8n.",
                icon: "✏️",
              },
              {
                step: "02",
                title: "Alguien escanea",
                desc: "El usuario escanea el QR y es redirigido a WhatsApp automáticamente.",
                icon: "📱",
              },
              {
                step: "03",
                title: "n8n recibe el evento",
                desc: "Tu flujo de n8n recibe los datos del escaneo y ejecuta la automatización.",
                icon: "⚡",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 card-hover"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-sm font-bold text-[#25D366] mb-2">
                  PASO {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Todo lo que necesitas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "Múltiples QR Codes",
              desc: "Crea QR codes distintos para diferentes campañas, productos o departamentos.",
              icon: "🔲",
            },
            {
              title: "Webhook n8n integrado",
              desc: "Conecta cada QR a un webhook diferente en n8n para automatizaciones personalizadas.",
              icon: "🔗",
            },
            {
              title: "Analytics en tiempo real",
              desc: "Rastrea cuántas veces fue escaneado cada QR, desde qué dispositivos y cuándo.",
              icon: "📊",
            },
            {
              title: "Colores personalizables",
              desc: "Personaliza el color del QR para que coincida con tu marca.",
              icon: "🎨",
            },
            {
              title: "Descarga en alta resolución",
              desc: "Descarga tus QR codes en PNG listos para imprimir o publicar digitalmente.",
              icon: "⬇️",
            },
            {
              title: "Mensaje pre-llenado",
              desc: "El usuario abre WhatsApp con un mensaje ya escrito, mejorando la conversión.",
              icon: "💬",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex gap-4 p-6 rounded-xl border border-gray-100 card-hover bg-white"
            >
              <div className="text-3xl">{f.icon}</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-wa py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Empieza a automatizar con WhatsApp hoy
        </h2>
        <p className="text-green-100 mb-8 text-lg">
          Sin límites. Sin tarjeta de crédito. 100% gratuito.
        </p>
        <Link
          href="/dashboard/new"
          className="bg-white text-[#25D366] px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-colors inline-block"
        >
          Crear mi primer QR Code
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        <p>QRConnect &copy; {new Date().getFullYear()} — Potenciado por WhatsApp + n8n</p>
      </footer>
    </div>
  );
}
