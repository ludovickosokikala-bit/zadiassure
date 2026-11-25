import { createFileRoute,useNavigate } from '@tanstack/react-router';
import { ClientsPage,type ClientFilters } from '@/components/crm-foundation/pages';
import { foundationQuery,crmHead } from '@/components/crm-foundation/data';
import { FoundationError,FoundationNotFound } from '@/components/crm-foundation/ui';
export const Route=createFileRoute('/crm/clients/')({
 validateSearch:(s:Record<string,unknown>):ClientFilters=>({...(typeof s['q']==='string'?{q:s['q']}:{}),...(typeof s['type']==='string'?{type:s['type']}:{}),...(typeof s['sort']==='string'?{sort:s['sort']}: {})}),
 loader:({context})=>context.queryClient.ensureQueryData(foundationQuery()),head:()=>crmHead('Klanten'),errorComponent:FoundationError,notFoundComponent:FoundationNotFound,component:Page,
});
function Page(){const filters=Route.useSearch();const navigate=useNavigate();return <ClientsPage filters={filters} onFilters={v=>void navigate({to:'/crm/clients',search:v,replace:true})}/>;}
