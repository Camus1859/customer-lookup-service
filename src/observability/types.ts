export type DashBoardMetrics = {
  CacheHit: number;
  CacheMiss: number;
  Error: number;
  AverageLatency: number;
};

export type Outcome = "HIT" | "MISS" | "ERROR" | "SUCCESS" | "SKIPPED";

export type Step = "Cache_Check" | "DB_QUERY" | "CACHE_WRITE";

export type TraceStep = {
  step: Step;
  time: number;
  result: Outcome;
};

export type RequestJourney = {
  id: string;
  endpoint: string;
  steps: TraceStep[];
  total_time: number;
  final_outcome: Outcome;
};

export type Event = "Metrics" | "Trace" | "Status";

export type ConnectionStatus = {
  redisConnected: boolean;
  postgresConnected: boolean;
};

export type SSE = {
  type: Event;
  data: DashBoardMetrics | RequestJourney | ConnectionStatus;
};
