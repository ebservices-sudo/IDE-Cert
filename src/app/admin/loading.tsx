export default function AdminLoading() {
  return (
    <div aria-busy className="space-y-4">
      <div className="h-8 w-56 animate-pulse rounded bg-white" />
      <div className="h-24 animate-pulse rounded-xl bg-white" />
      <div className="h-80 animate-pulse rounded-xl bg-white" />
    </div>
  );
}
