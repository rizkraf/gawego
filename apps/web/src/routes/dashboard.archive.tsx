import { ArchiveTable } from '@/components/archive-table';
import { authClient } from '@/lib/auth-client';

export default function DashboardArchive() {
  const { isPending } = authClient.useSession();

  return <ArchiveTable isPending={isPending} />;
}
