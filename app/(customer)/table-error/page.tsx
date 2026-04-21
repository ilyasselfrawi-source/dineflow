import Link from "next/link";

export default function TableErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const isInactive = searchParams.reason === "inactive";

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h1 className="font-display text-2xl font-bold text-stone-800 mb-3">
        {isInactive ? "Table Not Available" : "Invalid QR Code"}
      </h1>
      <p className="text-stone-500 max-w-xs text-sm leading-relaxed">
        {isInactive
          ? "This table is not currently active. Please ask a staff member for assistance."
          : "This QR code doesn't match any table in our system. Please scan the QR code on your table again, or ask a staff member for help."}
      </p>
      <div className="mt-8 p-4 bg-white rounded-xl border border-stone-200 max-w-xs w-full">
        <p className="text-xs text-stone-500">
          If you believe this is an error, please speak to a member of our staff and we'll be happy to help.
        </p>
      </div>
    </div>
  );
}
