// app/page.tsx
import Header from './components/layout/Header';
import ClientComponentsWrapper from './components/ClientComponentsWrapper';

export default function WeatherMapPage() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        <ClientComponentsWrapper />
      </main>
    </div>
  );
}
