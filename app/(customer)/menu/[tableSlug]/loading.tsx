export default function MenuLoading() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header skeleton */}
      <div className="bg-white border-b border-stone-100 px-4 py-4">
        <div className="skeleton h-6 w-40 mb-2" />
        <div className="skeleton h-4 w-24" />
      </div>

      {/* Category nav skeleton */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-100 px-4 py-3 flex gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton h-8 w-20 rounded-full flex-shrink-0" />
        ))}
      </div>

      {/* Items skeleton */}
      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        <div className="skeleton h-5 w-32 mb-4" />
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden flex gap-3 p-3">
            <div className="flex-1 space-y-2">
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-5 w-16 mt-2" />
            </div>
            <div className="skeleton w-24 h-24 rounded-xl flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
