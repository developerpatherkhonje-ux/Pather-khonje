import React, { useState } from "react";
import { ExternalLink, MessageCircle, Send } from "lucide-react";

function WhatsAppWebPanel() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("Hello, sharing your Pather Khonje travel document.");

  const openChat = () => {
    const cleanPhone = phone.replace(/[^\d]/g, "");
    const url = cleanPhone
      ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : "https://web.whatsapp.com/";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp Web</h1>
        <p className="text-sm text-gray-500">Login to WhatsApp Web once, then send invoice, receipt and itinerary messages from dashboard actions.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><MessageCircle className="h-7 w-7" /></div>
          <h2 className="text-lg font-bold">Connect WhatsApp Web</h2>
          <p className="mt-2 text-sm text-gray-500">Open WhatsApp Web, scan the QR, keep that browser session logged in. This avoids paid WhatsApp API setup.</p>
          <button onClick={() => window.open("https://web.whatsapp.com/", "_blank", "noopener,noreferrer")} className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white"><ExternalLink className="h-4 w-4" /> Open WhatsApp Web</button>
        </section>
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Quick Send Test</h2>
          <div className="mt-4 grid gap-4">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Customer WhatsApp number with country code" className="rounded-xl border px-4 py-3" />
            <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="rounded-xl border px-4 py-3" />
            <button onClick={openChat} className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white"><Send className="h-4 w-4" /> Open Chat With Message</button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default WhatsAppWebPanel;
