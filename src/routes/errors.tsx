export function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-brand-light px-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-brand-ink">404</h1>
        <p className="mt-2 text-xl text-brand-ink/60">Page not found</p>
        <p className="mt-4 text-brand-ink/60 max-w-md mx-auto">The page you're looking for doesn't exist.</p>
        <a href="/" className="mt-6 inline-block btn btn-primary">Go to dashboard</a>
      </div>
    </div>
  );
}

export function Forbidden() {
  return (
    <div className="flex h-screen items-center justify-center bg-brand-light px-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-brand-ink">403</h1>
        <p className="mt-2 text-xl text-brand-ink/60">Forbidden</p>
        <p className="mt-4 text-brand-ink/60 max-w-md mx-auto">You don't have permission to view this page.</p>
        <a href="/" className="mt-6 inline-block btn btn-primary">Go to dashboard</a>
      </div>
    </div>
  );
}

export function SessionExpired() {
  return (
    <div className="flex h-screen items-center justify-center bg-brand-light px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-ink">Session expired</h1>
        <p className="mt-2 text-brand-ink/60">Please sign in again to continue.</p>
        <a href="/login" className="mt-6 inline-block btn btn-primary">Sign in</a>
      </div>
    </div>
  );
}
