// app/components/layout/Header.tsx
export default function Header() {
  return (
    <header className="bg-white border-b shadow-sm px-6 py-3">
      <div className="flex items-center justify-between max-w-full">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-teal-600">SafeGuard Radar</h1>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">72°F</span>
            <span className="text-sm text-gray-600">Thunderstorms</span>
          </div>
        </div>

        <button className="px-6 py-3 rounded-lg bg-red-600 text-white font-bold text-lg hover:bg-red-700 transition-colors flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          EMERGENCY SOS
        </button>
      </div>
    </header>
  )
}