import { createFileRoute } from '@tanstack/react-router';
import { TeamPage } from '@/components/crm-foundation/Team';
import { foundationQuery,crmHead } from '@/components/crm-foundation/data';
import { FoundationError,FoundationNotFound } from '@/components/crm-foundation/ui';
import { teamQuery } from "@/components/crm-foundation/Team";
export const Route=createFileRoute('/crm/team')({loader:({ context }) => context.queryClient.ensureQueryData(teamQuery()),head:()=>crmHead('Team'),errorComponent:FoundationError,notFoundComponent:FoundationNotFound,component:Page});
function Page(){return <TeamPage/>;}
