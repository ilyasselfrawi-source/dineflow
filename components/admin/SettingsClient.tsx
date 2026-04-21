"use client";

import { useState } from "react";

interface Settings {
  id: string;
  restaurantName: string;
  logoUrl: string | null;
  currency: string;
  currencySymbol: string;
  isOpen: boolean;
  closedMessage: string;
  welcomeMessage: string;
  taxRate: number;
  serviceCharge: number;
  wifiSsid: string | null;
  wifiPassword: string | null;
  showWifi: boolean;
  primaryColor: string;
}

interface Props {
  initialSettings: Settings;
}

export default function SettingsClient({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof Settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const payload = {
        restaurantName: settings.restaurantName,
        logoUrl: settings.logoUrl || undefined,
        currency: settings.currency,
        currencySymbol: settings.currencySymbol,
        isOpen: settings.isOpen,
        closedMessage: settings.closedMessage,
        welcomeMessage: settings.welcomeMessage,
        taxRate: settings.taxRate,
        serviceCharge: settings.serviceCharge,
        wifiSsid: settings.wifiSsid || undefined,
        wifiPassword: settings.wifiPassword || undefined,
        showWifi: settings.showWifi,
        primaryColor: settings.primaryColor,
      };
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to save settings.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const toggleOpen = async () => {
    const newVal = !settings.isOpen;
    update("isOpen", newVal);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: newVal }),
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-stone-900">Settings</h1>
        {/* Quick open/closed toggle */}
        <button
          onClick={toggleOpen}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl font-semibold text-sm transition ${
            settings.isOpen
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${settings.isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          {settings.isOpen ? "Restaurant Open" : "Restaurant Closed"}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Restaurant Info */}
        <Section title="Restaurant Info">
          <Field label="Restaurant Name *">
            <input
              value={settings.restaurantName}
              onChange={(e) => update("restaurantName", e.target.value)}
              required maxLength={100}
              className={inputCls}
            />
          </Field>
          <Field label="Logo URL">
            <input
              type="url"
              value={settings.logoUrl ?? ""}
              onChange={(e) => update("logoUrl", e.target.value)}
              placeholder="https://example.com/logo.png"
              className={inputCls}
            />
          </Field>
          <Field label="Welcome Message">
            <input
              value={settings.welcomeMessage}
              onChange={(e) => update("welcomeMessage", e.target.value)}
              maxLength={300}
              className={inputCls}
            />
          </Field>
          <Field label="Closed Message">
            <textarea
              value={settings.closedMessage}
              onChange={(e) => update("closedMessage", e.target.value)}
              maxLength={300}
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </Field>
        </Section>

        {/* Currency & Taxes */}
        <Section title="Currency & Taxes">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Currency Code">
              <input
                value={settings.currency}
                onChange={(e) => update("currency", e.target.value)}
                maxLength={10}
                placeholder="USD"
                className={inputCls}
              />
            </Field>
            <Field label="Currency Symbol">
              <input
                value={settings.currencySymbol}
                onChange={(e) => update("currencySymbol", e.target.value)}
                maxLength={5}
                placeholder="$"
                className={inputCls}
              />
            </Field>
            <Field label="Tax Rate (%)">
              <input
                type="number"
                value={settings.taxRate}
                onChange={(e) => update("taxRate", parseFloat(e.target.value) || 0)}
                min="0" max="100" step="0.1"
                className={inputCls}
              />
            </Field>
            <Field label="Service Charge (%)">
              <input
                type="number"
                value={settings.serviceCharge}
                onChange={(e) => update("serviceCharge", parseFloat(e.target.value) || 0)}
                min="0" max="100" step="0.1"
                className={inputCls}
              />
            </Field>
          </div>
          <p className="text-xs text-stone-400 mt-1">Set to 0 to disable tax or service charge display.</p>
        </Section>

        {/* WiFi */}
        <Section title="WiFi Info">
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={settings.showWifi}
              onChange={(e) => update("showWifi", e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            <span className="text-sm text-stone-700 font-medium">Show WiFi info to customers</span>
          </label>
          {settings.showWifi && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="WiFi Network Name">
                <input
                  value={settings.wifiSsid ?? ""}
                  onChange={(e) => update("wifiSsid", e.target.value)}
                  maxLength={100}
                  placeholder="GuestNetwork"
                  className={inputCls}
                />
              </Field>
              <Field label="WiFi Password">
                <input
                  value={settings.wifiPassword ?? ""}
                  onChange={(e) => update("wifiPassword", e.target.value)}
                  maxLength={100}
                  placeholder="password123"
                  className={inputCls}
                />
              </Field>
            </div>
          )}
        </Section>

        {/* Branding */}
        <Section title="Branding">
          <Field label="Primary Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => update("primaryColor", e.target.value)}
                className="w-12 h-10 rounded-xl border border-stone-200 p-1 cursor-pointer"
              />
              <input
                value={settings.primaryColor}
                onChange={(e) => update("primaryColor", e.target.value)}
                pattern="^#[0-9A-Fa-f]{6}$"
                placeholder="#e85d04"
                className={`${inputCls} flex-1`}
              />
            </div>
          </Field>
        </Section>

        {/* Save */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-stone-700 transition"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Saved!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300 transition bg-white";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="font-semibold text-stone-800 mb-4 text-sm uppercase tracking-wide">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
