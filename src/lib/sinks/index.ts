import { SinkConfig, SinkNotifyTrigger, RunResult } from "../types";

export interface Sink {
  name: string;
  send(run: RunResult): Promise<void>;
}

export function shouldNotify(triggers: SinkNotifyTrigger[] | undefined, status: "pass" | "fail" | "skip"): boolean {
  if (!triggers || triggers.length === 0) return false;
  if (triggers.includes("always")) return true;
  if (triggers.includes("failure") && status === "fail") return true;
  if (triggers.includes("success") && status === "pass") return true;
  return false;
}

export async function createSink(config: SinkConfig): Promise<Sink | null> {
  switch (config.type) {
    case "fs":
      const { FsSink } = await import("./fs");
      return new FsSink(config);
    case "s3":
      const { S3Sink } = await import("./s3");
      return new S3Sink(config);
    case "slack":
      const { SlackSink } = await import("./slack");
      return new SlackSink(config);
    case "linear":
      const { LinearSink } = await import("./linear");
      return new LinearSink(config);
    default:
      return null;
  }
}

export async function dispatchToSinks(sinks: SinkConfig[], run: RunResult): Promise<void> {
  for (const config of sinks) {
    const triggers = "notify_on" in config ? config.notify_on : undefined;
    if (!shouldNotify(triggers, run.status)) continue;

    try {
      const sink = await createSink(config);
      if (sink) {
        await sink.send(run);
      }
    } catch (err) {
      console.error(`Sink ${config.type} failed:`, (err as Error).message);
    }
  }
}
