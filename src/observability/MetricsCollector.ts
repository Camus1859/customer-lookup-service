import { DashBoardMetrics } from "./types";

class MetricsCollector {
  private hit: number = 0;
  private miss: number = 0;
  private error: number = 0;
  private totalLatency: number = 0;
  private requestCount: number = 0;

  public recordHit(latencyMs: number): void {
    this.hit += 1;
    this.totalLatency += latencyMs;
    this.requestCount += 1;
  }

  public recordMiss(latencyMs: number): void {
    this.miss += 1;
    this.totalLatency += latencyMs;
    this.requestCount += 1;
  }

  public recordError(): void {
    this.error += 1;
  }

  public getMetrics(): DashBoardMetrics {
    const averageLatency =
      this.requestCount === 0 ? 0 : this.totalLatency / this.requestCount;
    const cacheHit = this.hit;
    const cacheMiss = this.miss;
    const error = this.error;

    return { cacheHit, cacheMiss, error, averageLatency };
  }

  public reset(): void {
    this.hit = 0;
    this.miss = 0;
    this.error = 0;
    this.totalLatency = 0;
    this.requestCount = 0;
  }
}

const metricsCollector = new MetricsCollector();

export { metricsCollector };
