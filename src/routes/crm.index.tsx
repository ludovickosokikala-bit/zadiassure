import { createFileRoute } from '@tanstack/react-router';
import { TodayPage } from '@/components/crm-foundation/pages';
import { foundationQuery,crmHead } from '@/components/crm-foundation/data';
import { FoundationError,FoundationNotFound } from '@/components/crm-foundation/ui';
export const Route=createFileRoute('/crm/')({loader:({ context }) => context.queryClient.ensureQueryData(foundationQuery()),head:()=>crmHead('Vandaag'),errorComponent:FoundationError,notFoundComponent:FoundationNotFound,component:Page});
function Page(){return <TodayPage/>;}
