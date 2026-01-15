import { Outcome, RequestJourney, Step, TraceStep } from "./types";

class RequestTracer {
  private id: string;
  private endpoint: string;
  private steps: TraceStep[] = [];
  private startTime: number;

  constructor(endpoint: string) {
    this.id = crypto.randomUUID();
    this.endpoint = endpoint;
    this.startTime = performance.now();
  }

  addStep(step: Step, time: number, result: Outcome): void {
    this.steps.push({ step, time, result });
  }

  finish(): RequestJourney {
    const totalTime = performance.now() - this.startTime;
    const finalOutcome = this.steps.length > 0 ? this.steps[0].result : "ERROR";

    return {
      id: this.id,
      endpoint: this.endpoint,
      steps: this.steps,
      total_time: totalTime,
      final_outcome: finalOutcome,
    };
  }
}

export { RequestTracer };
