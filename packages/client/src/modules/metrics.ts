import { Metrics } from "../types";

export class MetricsCollector {
  private collector?: (metrics: Metrics) => void;

  setCollector(collector: (metrics: Metrics) => void): void {
    this.collector = collector;
  }

  collect(metrics: Metrics): void {
    if (this.collector) {
      this.collector(metrics);
    }
  }

  startTiming(): () => number {
    const startTime = Date.now();
    return () => Date.now() - startTime;
  }
}
