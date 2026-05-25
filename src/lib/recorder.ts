import path from "node:path";
import { AgentBrowserOptions, runAgentBrowser } from "./agentBrowser";
import { RecordingPolicy } from "./types";

export interface RecorderHandle {
  start(): Promise<void>;
  stop(): Promise<RecorderArtifacts>;
}

export interface RecorderArtifacts {
  video?: string;
  har?: string;
  trace?: string;
  console?: string;
}

export interface RecorderOpts {
  abOpts: AgentBrowserOptions;
  runDir: string;
  policy: RecordingPolicy;
  forceCaptureOnFailure?: boolean;
}

export function createRecorder(opts: RecorderOpts): RecorderHandle {
  const artifacts: RecorderArtifacts = {};
  const startedKinds: Array<"video" | "har" | "trace"> = [];

  const wantVideoOnStart = opts.policy.video === "always";
  const wantHarOnStart = opts.policy.har === "always" || opts.policy.har === "on-failure";
  const wantTraceOnStart = opts.policy.trace === "always" || opts.policy.trace === "on-failure";
  const wantConsole = opts.policy.console !== "off";

  const videoPath = path.join(opts.runDir, "video.webm");
  const harPath = path.join(opts.runDir, "network.har");
  const tracePath = path.join(opts.runDir, "trace.json");
  const consolePath = path.join(opts.runDir, "console.json");

  return {
    async start() {
      if (wantVideoOnStart) {
        const r = await runAgentBrowser(opts.abOpts, ["record", "start", videoPath]);
        if (r.exit_code === 0) {
          startedKinds.push("video");
          artifacts.video = videoPath;
        }
      }
      if (wantHarOnStart) {
        const r = await runAgentBrowser(opts.abOpts, ["network", "har", "start"]);
        if (r.exit_code === 0) startedKinds.push("har");
      }
      if (wantTraceOnStart) {
        const r = await runAgentBrowser(opts.abOpts, ["trace", "start", tracePath]);
        if (r.exit_code === 0) startedKinds.push("trace");
      }
    },
    async stop(): Promise<RecorderArtifacts> {
      if (startedKinds.includes("video")) {
        await runAgentBrowser(opts.abOpts, ["record", "stop"]);
        artifacts.video = videoPath;
      }
      if (startedKinds.includes("har")) {
        await runAgentBrowser(opts.abOpts, ["network", "har", "stop", harPath]);
        artifacts.har = harPath;
      }
      if (startedKinds.includes("trace")) {
        await runAgentBrowser(opts.abOpts, ["trace", "stop", tracePath]);
        artifacts.trace = tracePath;
      }
      if (wantConsole) {
        const r = await runAgentBrowser(opts.abOpts, ["console"], { jsonOutput: true });
        if (r.exit_code === 0) {
          const fs = await import("node:fs/promises");
          const body = r.json !== undefined ? JSON.stringify(r.json, null, 2) : r.stdout;
          await fs.writeFile(consolePath, body, "utf8");
          artifacts.console = consolePath;
        }
      }
      return artifacts;
    },
  };
}
