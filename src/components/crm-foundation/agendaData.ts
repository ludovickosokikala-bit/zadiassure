import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { googleCalendarEvents, googleCalendarStatus, listAppointments } from "@/lib/crmAgenda.functions";

export const appointmentsQuery = () =>
  queryOptions({ queryKey: ["crm-appointments"], queryFn: () => listAppointments(), staleTime: 0 });
export type Appointment = Awaited<ReturnType<typeof listAppointments>>[number];

export const googleStatusQuery = () =>
  queryOptions({ queryKey: ["crm-google-status"], queryFn: () => googleCalendarStatus(), staleTime: 60_000 });

/** Busy events from the member's own Google Calendar; refreshed every 3 minutes. */
export const googleEventsQuery = (from: Date, to: Date) =>
  queryOptions({
    queryKey: ["crm-google", from.toISOString(), to.toISOString()],
    queryFn: () =>
      googleCalendarEvents({ data: { timeMin: from.toISOString(), timeMax: to.toISOString() } }),
    refetchInterval: 3 * 60_000,
    refetchOnWindowFocus: true,
    staleTime: 60_000,
    retry: false,
  });

export function useAgendaRefresh() {
  const qc = useQueryClient();
  return async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["crm-appointments"] }),
      qc.invalidateQueries({ queryKey: ["crm-foundation"] }),
      qc.invalidateQueries({ queryKey: ["crm-google"] }),
    ]);
  };
}
