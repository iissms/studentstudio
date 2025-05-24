// This page will likely not be rendered directly due to middleware.
// Middleware will redirect to /login or /dashboard based on auth state.
// Keeping a minimal component here as a fallback or if middleware is bypassed.
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
