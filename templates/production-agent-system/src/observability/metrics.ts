export type MetricType = "counter" | "histogram" | "gauge";

export type MetricRecord = {
  name: string;
  type: MetricType;
  value: number;
  timestamp: string;
  tags: Record<string, string>;
};

export type Metrics = {
  increment(name: string, value?: number, tags?: Record<string, string>): void;
  observe(name: string, value: number, tags?: Record<string, string>): void;
  gauge(name: string, value: number, tags?: Record<string, string>): void;
  records(): MetricRecord[];
  values(name: string): MetricRecord[];
};

export function createInMemoryMetrics(): Metrics {
  const records: MetricRecord[] = [];

  function record(type: MetricType, name: string, value: number, tags: Record<string, string> = {}): void {
    records.push({
      type,
      name,
      value,
      tags,
      timestamp: new Date().toISOString(),
    });
  }

  return {
    increment(name, value = 1, tags) {
      record("counter", name, value, tags);
    },
    observe(name, value, tags) {
      record("histogram", name, value, tags);
    },
    gauge(name, value, tags) {
      record("gauge", name, value, tags);
    },
    records() {
      return [...records];
    },
    values(name) {
      return records.filter((metric) => metric.name === name);
    },
  };
}
