"use client";

import { useState, useEffect } from "react";

interface Table {
  id: string;
  number: string;
  slug: string;
  isActive: boolean;
}

interface Props {
  table: Table;
  baseUrl: string;
  restaurantName: string;
  onClose: () => void;
  onRegenerateSlug: () => void;
}

export default function QRModal({ table, baseUrl, restaurantName, onClose, onRegenerateSlug }: Props) {
  const [qrData, setQrData] = useState<{ dataUrl: string; qrUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    fetchQR();
    return () => { document.body.style.overflow = ""; };
  }, [table.id]);

  const fetchQR = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tables/${table.id}/qr`);
      if (res.ok) setQrData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const downloadPNG = () => {
    if (!qrData) return;
    const a = document.createElement("a");
    a.href = qrData.dataUrl;
    a.download = `dineflow-${table.number.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    a.click();
  };

  const downloadSVG = async () => {
    const res = await fetch(`/api/admin/tables/${table.id}/qr?format=svg`);
    const svg = await res.text();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dineflow-${table.number.replace(/\s+/g, "-").toLowerCase()}-qr.svg`;
    a.click();
  };

  const handlePrint = () => {
    if (!qrData) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${table.number}</title>
        <style>
          body { font-family: Georgia, serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: white; }
          .card { text-align: center; border: 2px solid #1a1a1a; border-radius: 16px; padding: 32px 40px; max-width: 320px; }
          .restaurant { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
          .table { font-size: 28px; font-weight: bold; color: #1a1a1a; margin-bottom: 16px; }
          .qr { width: 200px; height: 200px; margin: 0 auto 16px; }
          .instruction { font-size: 13px; color: #444; line-height: 1.5; }
          .url { font-size: 10px; color: #888; margin-top: 12px; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="card">
          <p class="restaurant">${restaurantName}</p>
          <p class="table">${table.number}</p>
          <img class="qr" src="${qrData.dataUrl}" alt="QR Code" />
          <p class="instruction">📱 Scan to view menu & order</p>
          <p class="url">${qrData.qrUrl}</p>
        </div>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `);
    win.document.close();
  };

  const qrUrl = qrData?.qrUrl ?? `${baseUrl}/menu/${table.slug}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-stone-900">QR Code</h3>
            <p className="text-xs text-stone-500">{table.number}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* QR Preview */}
        <div className="p-6 text-center">
          {loading ? (
            <div className="w-48 h-48 mx-auto skeleton rounded-2xl mb-4" />
          ) : qrData ? (
            <>
              {/* Print card preview */}
              <div className="border-2 border-stone-800 rounded-2xl p-5 inline-block mb-5">
                <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">{restaurantName}</p>
                <p className="font-display text-lg font-bold text-stone-900 mb-3">{table.number}</p>
                <img src={qrData.dataUrl} alt="QR Code" className="w-44 h-44 mx-auto" />
                <p className="text-xs text-stone-500 mt-3">📱 Scan to view menu & order</p>
              </div>

              {/* URL */}
              <p className="text-[10px] text-stone-400 break-all mb-4 font-mono px-2">{qrUrl}</p>
            </>
          ) : (
            <p className="text-sm text-red-500 mb-4">Failed to generate QR code.</p>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={downloadPNG}
              disabled={!qrData}
              className="flex items-center justify-center gap-2 border border-stone-200 rounded-xl py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              PNG
            </button>
            <button
              onClick={downloadSVG}
              disabled={!qrData}
              className="flex items-center justify-center gap-2 border border-stone-200 rounded-xl py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              SVG
            </button>
          </div>

          <button
            onClick={handlePrint}
            disabled={!qrData}
            className="w-full bg-stone-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-stone-700 disabled:opacity-40 transition mb-3"
          >
            🖨️ Print QR Card
          </button>

          <button
            onClick={() => {
              if (confirm("This will generate a new QR URL for this table. Old QR codes will stop working. Continue?")) {
                onRegenerateSlug();
              }
            }}
            className="w-full text-xs text-stone-400 hover:text-red-500 py-2 transition"
          >
            Regenerate QR (invalidates old code)
          </button>
        </div>
      </div>
    </div>
  );
}
