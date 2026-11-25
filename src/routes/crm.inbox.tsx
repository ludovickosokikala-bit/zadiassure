import { createFileRoute } from '@tanstack/react-router';
import { ComingPage } from '@/components/crm-foundation/pages';
import { foundationQuery,crmHead } from '@/components/crm-foundation/data';
import { FoundationError,FoundationNotFound } from '@/components/crm-foundation/ui';
export const Route=createFileRoute('/crm/inbox')({loader:({ context }) => context.queryClient.ensureQueryData(foundationQuery()),head:()=>crmHead('Postvak'),errorComponent:FoundationError,notFoundComponent:FoundationNotFound,component:Page});
function Page(){return <ComingPage kind="inbox"/>;}
