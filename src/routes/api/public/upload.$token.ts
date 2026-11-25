import { createFileRoute } from "@tanstack/react-router";
import { UPLOAD_RATE, isAllowedUpload, requestStatus, storedStatus } from "@/lib/phase5Core";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export const Route = createFileRoute("/api/public/upload/$token")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const { findRequest, publicView } = await import("@/lib/uploadRequest.server");
        const found = await findRequest(params.token);
        if (!found) return json({ error: "NOT_FOUND" }, 404);
        const { admin, req } = found;
        const status = requestStatus(req, new Date());
        if (status === "expired" || status === "complete") return json({ error: status.toUpperCase() }, 410);
        const since = new Date(Date.now() - UPLOAD_RATE.windowMinutes * 60000).toISOString();
        const [recent, total] = await Promise.all([
          admin.from("crm_documents").select("id", { count: "exact", head: true }).eq("request_id", req.id).gte("created_at", since),
          admin.from("crm_documents").select("id", { count: "exact", head: true }).eq("request_id", req.id),
        ]);
        if ((recent.count ?? 0) >= UPLOAD_RATE.perWindow || (total.count ?? 0) >= UPLOAD_RATE.total) return json({ error: "RATE_LIMIT" }, 429);
        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return json({ error: "BAD_REQUEST" }, 400);
        }
        const file = form.get("file");
        const itemId = String(form.get("item") ?? "");
        const item = req.items.find((i) => i.id === itemId);
        if (!(file instanceof File) || !item) return json({ error: "BAD_REQUEST" }, 400);
        if (!isAllowedUpload(file.name, file.type, file.size)) return json({ error: "FILE_TYPE" }, 415);
        const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
        const path = `${req.organization_id}/${req.client_id}/requests/${crypto.randomUUID()}.${ext}`;
        const up = await admin.storage.from("crm-documents").upload(path, file, { contentType: file.type || "application/octet-stream" });
        if (up.error) return json({ error: "UPLOAD_FAILED" }, 500);
        await admin.from("crm_documents").insert({
          organization_id: req.organization_id, client_id: req.client_id, dossier_id: req.dossier_id, request_id: req.id,
          category: "client_upload", name: `${item.label} – ${file.name}`.slice(0, 250), storage_path: path,
          mime_type: file.type, size_bytes: file.size, uploaded_by_label: "Klant / Client",
        });
        const items = req.items.map((i) => (i.id === item.id ? { ...i, received: true } : i));
        await admin.from("crm_doc_requests").update({ items, status: storedStatus(items) }).eq("id", req.id);
        if (item.imm_document_id) {
          await admin.from("crm_imm_documents").update({ status: "received" }).eq("id", item.imm_document_id).in("status", ["missing", "requested"]);
        }
        if (!item.received)
          await admin.from("crm_timeline").insert({ organization_id: req.organization_id, client_id: req.client_id, dossier_id: req.dossier_id, kind: "doc_received", detail: { document: item.label } });
        return json(publicView({ ...req, items }));
      },
    },
  },
});
