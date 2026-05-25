import pc from "picocolors";
import { loadProject } from "../lib/config";
import { readIndex, IndexEntry } from "../lib/summary";

export interface TrendOptions {
  days?: string;
  scenario?: string;
  json?: boolean;
}

interface TrendData {
  scenario: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
}

export async function trend(opts: TrendOptions): Promise<void> {
  const project = loadProject({ requireQaDir: false });
  let entries = readIndex(project.root);

  const days = parseInt(opts.days ?? "30", 10);
  const cutoff = Date.now() - days * 24 * 3600 * 1000;
  entries = entries.filter((e) => new Date(e.started_at).getTime() >= cutoff);

  if (opts.scenario) {
    entries = entries.filter((e) => e.scenario === opts.scenario);
  }

  // Group by scenario
  const byScenario = new Map<string, IndexEntry[]>();
  for (const e of entries) {
    const arr = byScenario.get(e.scenario) ?? [];
    arr.push(e);
    byScenario.set(e.scenario, arr);
  }

  const trends: TrendData[] = [];
  for (const [scenario, runs] of byScenario) {
    const passed = runs.filter((r) => r.status === "pass").length;
    const failed = runs.filter((r) => r.status === "fail").length;
    const skipped = runs.filter((r) => r.status === "skip").length;
    trends.push({
      scenario,
      total: runs.length,
      passed,
      failed,
      skipped,
      passRate: runs.length > 0 ? (passed / runs.length) * 100 : 0,
    });
  }

  trends.sort((a, b) => a.scenario.localeCompare(b.scenario));

  if (opts.json) {
    console.log(JSON.stringify({ days, trends }, null, 2));
    return;
  }

  if (trends.length === 0) {
    console.log(pc.yellow(`No runs in the last ${days} days.`));
    return;
  }

  console.log(pc.cyan(`Pass rate trends (last ${days} days):`));
  console.log("");
  console.log("  Scenario                   Runs    Pass    Fail    Skip    Rate");
  console.log("  ------------------------   ----    ----    ----    ----    ----");

  for (const t of trends) {
    const scenario = t.scenario.padEnd(24).slice(0, 24);
    const total = String(t.total).padStart(4);
    const passed = String(t.passed).padStart(4);
    const failed = String(t.failed).padStart(4);
    const skipped = String(t.skipped).padStart(4);
    const rate = `${t.passRate.toFixed(1)}%`.padStart(5);
    const rateColor = t.passRate >= 90 ? pc.green : t.passRate >= 70 ? pc.yellow : pc.red;
    console.log(`  ${scenario}   ${total}    ${passed}    ${failed}    ${skipped}    ${rateColor(rate)}`);
  }

  // Overall stats
  const totalRuns = entries.length;
  const totalPassed = entries.filter((e) => e.status === "pass").length;
  const overallRate = totalRuns > 0 ? (totalPassed / totalRuns) * 100 : 0;
  console.log("");
  console.log(`  Overall: ${totalRuns} runs, ${overallRate.toFixed(1)}% pass rate`);
}
