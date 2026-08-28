import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      <nav className="flex flex-wrap items-center gap-4 border-b border-line bg-white px-4 py-3 text-sm">
        <Link href="/admin" className="serif text-lg">
          Aurevia desk
        </Link>
        <Link href="/admin/leads">Leads</Link>
        <Link href="/admin/calendar">Calendar</Link>
        <Link href="/admin/notifications">Notifications</Link>
        <Link href="/admin/outreach">Outreach</Link>
        <Link href="/" className="ml-auto">
          View site
        </Link>
      </nav>
      {children}
    </div>
  );
}
