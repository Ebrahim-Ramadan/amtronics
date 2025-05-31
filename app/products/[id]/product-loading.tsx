export default function LoadingProductPage() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="mb-6 h-4 w-40 bg-gray-200 rounded" />
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image skeleton */}
        <div className="relative">
          <div className="w-full h-[300px] md:h-[500px] bg-gray-200 rounded-lg" />
        </div>
        {/* Details skeleton */}
        <div className="space-y-6">
          <div>
            <div className="h-8 w-2/3 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-5 w-5 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>
          <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-6 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-10 w-full bg-gray-200 rounded mb-2" />
          <div className="h-24 w-full bg-gray-200 rounded mb-2" />
        </div>
      </div>
      <div className="mt-12">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="h-4 w-full bg-gray-200 rounded mb-2" />
        <div className="h-4 w-5/6 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
      </div>
    </div>
  )
} 