import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mb-4">
        {isPending ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <h1 className="text-2xl font-bold">Halo, {session?.user.name} 👋</h1>
        )}
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Card variant="mixed">
          <CardHeader>
            <CardTitle>Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Belum ada data.</p>
          </CardContent>
        </Card>
        <Card variant="mixed">
          <CardHeader>
            <CardTitle>Wawancara</CardTitle>
          </CardHeader>
          <CardContent className="">
            <p>Belum ada data.</p>
          </CardContent>
        </Card>
        <Card variant="mixed">
          <CardHeader>
            <CardTitle>Tawaran</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Belum ada data.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
