import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ctaVariants } from "@/components/ui/cta";
import { cn } from "@/lib/utils";
import { listClients } from "@/lib/crm.functions";
import { Empty, PageHead, Panel, Pill } from "@/components/crm/ui";
import { clientName, formatDate, useCrmDict } from "@/components/crm/useCrm";
import { ClientDialog } from "@/components/crm/dialogs";

export const Route = createFileRoute("/crm/clients/")({ component: ClientsPage });

function ClientsPage() {
  const c = useCrmDict();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const fetchClients = useServerFn(listClients);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["crm", "clients", search],
    queryFn: () => fetchClients({ data: { search } }),
  });

  return (
    <>
      <PageHead
        title={c.clients.title}
        intro={c.clients.intro}
        action={
          <button
            onClick={() => setOpen(true)}
            className={cn(ctaVariants({ variant: "primary", size: "sm" }))}
          >
            <Plus className="mr-1 h-4 w-4" /> {c.clients.newClient}
          </button>
        }
      />
      <Panel>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={c.common.search}
          className="mb-4 max-w-sm"
        />
        {isLoading ? (
          <Empty text={c.common.loading} />
        ) : !data || data.items.length === 0 ? (
          <Empty text={c.common.empty} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4">{c.clients.title}</th>
                  <th className="py-2 pr-4">{c.clients.type}</th>
                  <th className="py-2 pr-4">{c.clients.email}</th>
                  <th className="py-2 pr-4">{c.clients.phone}</th>
                  <th className="py-2 pr-4">{c.clients.status}</th>
                  <th className="py-2">{c.common.updated}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/40">
                    <td className="py-3 pr-4">
                      <Link
                        to="/crm/clients/$id"
                        params={{ id: row.id }}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {clientName(row)}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {c.clientType[row.client_type as keyof typeof c.clientType] ?? row.client_type}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{row.email || "—"}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{row.phone || "—"}</td>
                    <td className="py-3 pr-4">
                      <Pill className="bg-muted text-foreground">{row.status}</Pill>
                    </td>
                    <td className="py-3 text-muted-foreground">{formatDate(row.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <ClientDialog open={open} onOpenChange={setOpen} onSaved={() => refetch()} />
    </>
  );
}
