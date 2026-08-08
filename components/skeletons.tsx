export function SkeletonCard({ lines = 1 }: { lines?: number }) {
  return (
    <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30 space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-4" style={{ width: `${60 + Math.random() * 40}%` }} />
      ))}
    </div>
  );
}

export function SkeletonWidget() {
  return (
    <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
      <div className="skeleton h-3 w-16 mb-2" />
      <div className="skeleton h-8 w-20" />
    </div>
  );
}

export function SkeletonCircle({ size = 72 }: { size?: number }) {
  return <div className="skeleton rounded-full mx-auto" style={{ width: size, height: size }} />;
}
