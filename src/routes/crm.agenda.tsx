import { createFileRoute } from '@tanstack/react-router';
import { ComingPage } from '@/components/crm-foundation/pages';
import { foundationQuery,crmHead } from '@/components/crm-foundation/data';
import { FoundationError,FoundationNotFound } from '@/components/crm-foundation/ui';
export const Route=createFileRoute('/crm/agenda')({loader:({ context }) => context.queryClient.ensureQueryData(foundationQuery()),head:()=>crmHead('Agenda'),errorComponent:FoundationError,notFoundComponent:FoundationNotFound,component:Page});
function Page(){return <ComingPage kind="agenda"/>;}
