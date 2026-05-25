import fs from "node:fs";
import path from "node:path";
import { RunResult } from "./types";
import { projectPaths } from "./paths";
import { parseRunId } from "./runId";

export interface IndexEntry {
  run_id: string;
  scenario: string;
  env: string;
  user: string;
  started_at: string;
  finished_at: string;
  duration_ms: number;
  status: "pass" | "fail" | "skip";
  fail_step?: number;
  fail_message?: string;
  artifact_dir: string;
  report?: string;
}

export function appendIndex(projectRoot: string, run: RunResult): void {
  const p = projectPaths(projectRoot);
  fs.mkdirSync(p.runsDir, { recursive: true });
  const entry: IndexEntry = {
    run_id: run.run_id,
    scenario: run.scenario,
    env: run.env,
    user: run.user,
    started_at: run.started_at,
    finished_at: run.finished_at,
    duration_ms: run.duration_ms,
    status: run.status,
    fail_step: run.fail_step,
    fail_message: run.fail_message,
    artifact_dir: run.artifacts.dir,
    report: run.artifacts.report,
  };
  const indexFile = path.join(p.runsDir, "index.jsonl");
  fs.appendFileSync(indexFile, JSON.stringify(entry) + "\n", "utf8");
  updateLatestSymlink(p.runsDir, run.artifacts.dir);
}

export function readIndex(projectRoot: string): IndexEntry[] {
  const p = projectPaths(projectRoot);
  const file = path.join(p.runsDir, "index.jsonl");
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => {
      try {
        return JSON.parse(l) as IndexEntry;
      } catch {
        return null;
      }
    })
    .filter((x): x is IndexEntry => x !== null);
}

export function rewriteIndex(projectRoot: string, entries: IndexEntry[]): void {
  const p = projectPaths(projectRoot);
  fs.mkdirSync(p.runsDir, { recursive: true });
  const file = path.join(p.runsDir, "index.jsonl");
  fs.writeFileSync(file, entries.map((e) => JSON.stringify(e)).join("\n") + (entries.length ? "\n" : ""), "utf8");
}

export function rebuildSummary(projectRoot: string): void {
  const p = projectPaths(projectRoot);
  const entries = readIndex(projectRoot);
  const file = path.join(p.runsDir, "SUMMARY.md");
  fs.mkdirSync(p.runsDir, { recursive: true });
  fs.writeFileSync(file, renderSummary(entries), "utf8");
}

function renderSummary(entries: IndexEntry[]): string {
  const sorted = [...entries].sort((a, b) => (a.started_at < b.started_at ? 1 : -1));
  const out: string[] = [];
  out.push(`# QA Runs Summary`);
  out.push("");
  out.push(`_Last updated: ${new Date().toISOString()}_`);
  out.push("");
  if (entries.length === 0) {
    out.push("No runs yet. Run a scenario with `npx qa-agent run <scenario>`.");
    return out.join("\n");
  }

  const last7 = byWindow(sorted, 7);
  const last30 = byWindow(sorted, 30);
  out.push(`## Last 7 days`);
  out.push("");
  out.push(statLine(last7));
  out.push("");
  out.push(`## Last 30 days`);
  out.push("");
  out.push(statLine(last30));
  out.push("");

  out.push(`## Latest ${Math.min(sorted.length, 20)} runs`);
  out.push("");
  out.push(`| Run | Scenario | Env | User | Status | Duration | Failed step |`);
  out.push(`|-----|----------|-----|------|--------|----------|-------------|`);
  for (const r of sorted.slice(0, 20)) {
    const reportRel = r.report ? path.relative(path.dirname(file(r)), r.report) : "";
    const link = reportRel
      ? `[${shortIso(r.started_at)}](${path.basename(r.artifact_dir)}/report.md)`
      : shortIso(r.started_at);
    out.push(
      `| ${link} | ${r.scenario} | ${r.env} | ${r.user} | ${statusIcon(r.status)} | ${(r.duration_ms / 1000).toFixed(1)}s | ${r.fail_step !== undefined ? `step ${r.fail_step}` : "—"} |`,
    );
  }
  out.push("");

  out.push(`## Pass rate by scenario (last 30 days)`);
  out.push("");
  out.push(`| Scenario | Runs | Pass % |`);
  out.push(`|----------|------|--------|`);
  const byScenario = new Map<string, IndexEntry[]>();
  for (const r of last30) {
    const arr = byScenario.get(r.scenario) ?? [];
    arr.push(r);
    byScenario.set(r.scenario, arr);
  }
  for (const [scenario, rs] of [...byScenario.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const passes = rs.filter((r) => r.status === "pass").length;
    const pct = ((passes / rs.length) * 100).toFixed(1);
    out.push(`| ${scenario} | ${rs.length} | ${pct}% |`);
  }
  out.push("");
  return out.join("\n");
}

function file(_: IndexEntry): string {
  return "SUMMARY.md";
}

function byWindow(entries: IndexEntry[], days: number): IndexEntry[] {
  const cutoff = Date.now() - days * 24 * 3600 * 1000;
  return entries.filter((e) => new Date(e.started_at).getTime() >= cutoff);
}

function statLine(entries: IndexEntry[]): string {
  if (entries.length === 0) return "_No runs in this window._";
  const passes = entries.filter((e) => e.status === "pass").length;
  const fails = entries.filter((e) => e.status === "fail").length;
  const skips = entries.filter((e) => e.status === "skip").length;
  const pct = ((passes / entries.length) * 100).toFixed(1);
  return `**${passes} passed**, **${fails} failed**, **${skips} skipped** of ${entries.length} runs (pass rate ${pct}%).`;
}

function statusIcon(s: "pass" | "fail" | "skip"): string {
  return s === "pass" ? "PASS" : s === "fail" ? "FAIL" : "SKIP";
}

function shortIso(s: string): string {
  return s.replace(/\.\d+Z$/, "Z");
}

function updateLatestSymlink(runsDir: string, runArtifactDir: string): void {
  const latest = path.join(runsDir, "latest");
  const target = path.basename(runArtifactDir);
  try {
    const stat = fs.lstatSync(latest);
    if (stat.isSymbolicLink() || stat.isDirectory()) fs.rmSync(latest, { recursive: true, force: true });
  } catch {
    /* not present */
  }
  try {
    fs.symlinkSync(target, latest, "dir");
  } catch {
    /* symlink may fail on some filesystems; ignore */
  }
}

export function pluckRunIdFromDir(dir: string): string | null {
  const base = path.basename(dir);
  return parseRunId(base) ? base : null;
}
