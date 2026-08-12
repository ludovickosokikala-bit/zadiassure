import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DOC_STATUSES } from "@/lib/crm.schemas";
import { listDocuments } from "@/lib/crm.functions";
import { Empty, PageHead, Panel, Pill, selectClass } from "@/components/crm/ui";
import { clientName, docTone, formatDate, useCrmDict } from "@/components/crm/useCrm";

export const Route = createFileRoute("/crm/documents")({ component: DocumentsPage });

function DocumentsPage() {
  const c = useCrmDict();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const fetchDocuments = useServerFn(listDocuments);
  const { data, isLoading } = useQuery({
    queryKey: ["crm", "documents", search, status],
    queryFn: () => fetchDocuments({ data: { search, status } }),
  });

  return (
    <>
      <PageHead title={c.documents.title} intro={c.documents.intro} />
      <Panel>
        <div className="mb-4 flex flex-wrap gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={c.common.search}
            className="max-w-xs"
          />
          <select
            className={cn(selectClass, "max-w-48")}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">{c.common.all}</option>
            {DOC_STATUSES.map((s) => (
              <option key={s} value={s}>
                {c.docStatus[s]}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <Empty text={c.common.loading} />
        ) : !data || data.items.length === 0 ? (
          <Empty text={c.documents.noDocuments} />
        ) : (
          <ul className="divide-y divide-border">
            {data.items.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {clientName(d.clients as never)}
                    {d.cases && (
                      <>
                        {" · "}
                        <Link
                          to="/crm/cases/$id"
                          params={{ id: (d.cases as { id: string }).id }}
                          className="hover:text-primary"
                        >
                          #{(d.cases as { case_number: number }).case_number}
                        </Link>
                      </>
                    )}
                    {d.document_type ? ` · ${d.document_type}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">{formatDate(d.expires_on)}</span>
                  <Pill className={docTone(d.status)}>
                    {c.docStatus[d.status as keyof typeof c.docStatus]}
                  </Pill>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted-foreground">{c.documents.uploadHint}</p>
      </Panel>
    </>
  );
}
