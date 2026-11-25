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
- CRM appointments live in crm_appointments; the CRM row is the source of truth and is pushed to the responsible member's own Google Calendar (connector google_calendar, per-user key in app_user_connections), linked by google_event_id + extendedProperties.zadiassureId. Why: Google failures must never block the CRM agenda, and the id link prevents duplicates.
- BUD follow-up proposals are computed (agendaCore.followUpProposal), not stored. Why: stays correct when follow-ups are edited, cancelled or completed.
- /crm, /auth, /uitnodiging and /oauth render without public site chrome (root layout check). Why: staff surfaces are a separate app on the CRM domain.
- Budget/debt module (crm_budgets, crm_budget_lines, crm_debts, crm_instalments; rules in src/lib/debtCore.ts): ZADIASSURE never receives or transfers money; instalments only record that the client paid. Outstanding amounts are adjusted by a DB trigger on instalment paid/unpaid, "late" is computed, never stored. Why: legal scope is administrative follow-up, not debt mediation.
- Payment proofs live in the private payment-proofs bucket under <organization_id>/<debt_id>/, staff-only via storage policies. Why: proofs contain financial personal data.
- Immigration module (crm_imm_procedures/persons/steps/documents/templates; rules in src/lib/immCore.ts): ZADIASSURE gives administrative guidance only; appeal deadlines are entered manually, never computed. Alerts (expiry 90/60/30 days, appeal 14/7 days) are computed, not stored. Why: no legal advice; stays correct when dates change.
- Immigration templates are per organization and admin-only (RLS foundation_admin); without a stored template the code defaults in immCore apply. Uploads live in the private imm-documents bucket under <organization_id>/<dossier_id>/.
