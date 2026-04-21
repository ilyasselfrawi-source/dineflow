import { getSettings } from "@/lib/services/settingsService";

export default async function ClosedPage() {
  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center px-6 text-center">
      {/* Candle / closed icon */}
      <div className="w-24 h-24 rounded-full bg-stone-800 flex items-center justify-center mb-8">
        <svg className="w-12 h-12 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
        </svg>
      </div>

      {settings.logoUrl && (
        <img
          src={settings.logoUrl}
          alt={settings.restaurantName}
          className="h-12 object-contain mb-4 opacity-80"
        />
      )}

      <h1 className="font-display text-3xl font-bold text-white mb-3">
        {settings.restaurantName}
      </h1>

      <div className="w-12 h-0.5 bg-amber-400 mx-auto mb-6" />

      <p className="text-stone-300 text-lg leading-relaxed max-w-sm">
        {settings.closedMessage}
      </p>

      <div className="mt-10 bg-stone-800 rounded-2xl px-8 py-6 max-w-xs w-full">
        <p className="text-stone-400 text-sm">
          We look forward to welcoming you soon.
        </p>
      </div>

      {/* WiFi info if available */}
      {settings.showWifi && settings.wifiSsid && (
        <div className="mt-6 bg-stone-800 rounded-2xl px-6 py-5 max-w-xs w-full text-left">
          <p className="text-xs text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0z" />
            </svg>
            Free WiFi
          </p>
          <p className="text-white font-medium text-sm">{settings.wifiSsid}</p>
          {settings.wifiPassword && (
            <p className="text-stone-400 text-sm mt-1">
              Password: <span className="text-stone-300 font-mono">{settings.wifiPassword}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
