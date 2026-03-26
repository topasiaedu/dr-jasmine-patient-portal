export function AdminPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 w-full animate-pulse mt-6">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded-md w-48"></div>
        <div className="h-4 bg-gray-200 rounded-md w-64"></div>
      </div>
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 rounded-2xl w-full border border-border"></div>
        <div className="h-32 bg-gray-200 rounded-2xl w-full border border-border"></div>
        <div className="h-32 bg-gray-200 rounded-2xl w-full border border-border"></div>
      </div>
    </div>
  );
}
