/**
 * Resilience backstop for dashboard queries: SSE (useLiveEvents) delivers
 * sub-second invalidation, but if a connection drops (proxy hiccup,
 * backgrounded tab), this refetch interval self-heals the data within a
 * bounded window without depending on the push channel.
 */
export const DASHBOARD_POLL_INTERVAL_MS = 30_000;
