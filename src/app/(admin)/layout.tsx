import PortalNav from '@/components/layout/PortalNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sacred-black">
      <PortalNav />
      <main className="pt-16">{children}</main>
    </div>
  );
}
