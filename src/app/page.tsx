export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
        <h1 className="text-2xl font-semibold tracking-tight">GTM Sonar OS</h1>
        <p className="text-sm text-muted">
          Scanning for founding GTM opportunities.
        </p>
      </div>
    </main>
  );
}
