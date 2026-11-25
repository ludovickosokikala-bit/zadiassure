import { createFileRoute } from '@tanstack/react-router';
import { DossierDetailPage } from '@/components/crm-foundation/pages';
import { foundationQuery,crmHead } from '@/components/crm-foundation/data';
import { FoundationError,FoundationNotFound } from '@/components/crm-foundation/ui';
export const Route=createFileRoute('/crm/cases/$id')({loader:({ context }) => context.queryClient.ensureQueryData(foundationQuery()),head:()=>crmHead('Dossier'),errorComponent:FoundationError,notFoundComponent:FoundationNotFound,component:Page});
function Page(){const { id } = Route.useParams();return <DossierDetailPage id={id}/>;}
