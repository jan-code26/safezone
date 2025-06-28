// app/components/ui/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
      <div className="text-gray-600 text-sm">{message}</div>
    </div>
  );
}

