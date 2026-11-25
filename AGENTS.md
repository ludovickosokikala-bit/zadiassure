<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Public site vs staff CRM are split by host in src/lib/host-routing.ts (server.ts redirects + root client fallback; robots.txt served from server.ts). Why: one project serves both domains; non-production hosts are never redirected so previews keep working.
- Phase 1 CRM uses crm_* foundation tables and an isolated crm-foundation UI/dictionary; legacy clients/cases remain only for preserved mandate/Gmail/calendar contracts, so later phases must explicitly bridge rather than mix identities.
- CRM preferences are stored per active organization member; theme tokens and system/Inter font are scoped to .crm-app so public website styling and language remain unchanged.
- Database triggers own client/dossier numbers, immutable identities and automatic actor-stamped timelines; organization-composite foreign keys prevent cross-organization links.
- Foundation roles are derived from administrator-managed legacy team roles for invitation compatibility; client-supplied profile/preferences never assign privileges.
