// app/components/layout/Header.tsx
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-white border-b shadow-sm px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Image
            src="/next.svg"
            alt="Weather Map"
            width={120}
            height={24}
            priority
            className="dark:invert"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            Emergency Weather & Contact Map
          </h1>
        </div>
        
        <nav className="flex items-center gap-4">
          <button className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors">
            Emergency Alert
          </button>
          <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
            Settings
          </button>
        </nav>
      </div>
    </header>
  );
}
