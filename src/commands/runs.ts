import pc from "picocolors";
import { loadProject } from "../lib/config";
import { readIndex, IndexEntry } from "../lib/summary";

export interface RunsOptions {
  last?: string;
  scenario?: string;
  env?: string;
  user?: string;
  failed?: boolean;
  json?: boolean;
}

export async function runs(opts: RunsOptions): Promise<void> {
  const project = loadProject({ requireQaDir: false });
  let entries = readIndex(project.root);

  // Apply filters
  if (opts.scenario) {
    entries = entries.filter((e) => e.scenario === opts.scenario);
  }
  if (opts.env) {
    entries = entries.filter((e) => e.env === opts.env);
  }
  if (opts.user) {
    entries = entries.filter((e) => e.user === opts.user);
  }
  if (opts.failed) {
    entries = entries.filter((e) => e.status === "fail");
  }

  // Sort by date descending
  entries.sort((a, b) => (a.started_at < b.started_at ? 1 : -1));

  // Limit
  const limit = parseInt(opts.last ?? "10", 10);
  entries = entries.slice(0, limit);

  if (opts.json) {
    console.log(JSON.stringify(entries, null, 2));
    return;
  }

  if (entries.length === 0) {
    console.log(pc.yellow("No runs found."));
    return;
  }

  console.log(pc.cyan(`Last ${entries.length} QA runs:`));
  console.log("");
  console.log("  Status  Scenario               Env        User       Duration  Started");
  console.log("  ------  --------------------   --------   --------   --------  -------");

  for (const e of entries) {
    const status = e.status === "pass" ? pc.green("PASS") : e.status === "fail" ? pc.red("FAIL") : pc.yellow("SKIP");
    const scenario = e.scenario.padEnd(20).slice(0, 20);
    const env = e.env.padEnd(8).slice(0, 8);
    const user = e.user.padEnd(8).slice(0, 8);
    const duration = `${(e.duration_ms / 1000).toFixed(1)}s`.padStart(7);
    const started = formatDate(e.started_at);
    console.log(`  ${status}  ${scenario}   ${env}   ${user}   ${duration}   ${started}`);
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hours}:${mins}`;
}
