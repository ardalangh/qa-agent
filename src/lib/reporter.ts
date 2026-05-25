import fs from "node:fs";
import path from "node:path";
import { RunResult, StepResult } from "./types";

export function writeRunArtifacts(runDir: string, result: RunResult): void {
  fs.mkdirSync(runDir, { recursive: true });
  const resultPath = path.join(runDir, "result.json");
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2), "utf8");
  result.artifacts.result = resultPath;

  const reportPath = path.join(runDir, "report.md");
  fs.writeFileSync(reportPath, renderReportMarkdown(result), "utf8");
  result.artifacts.report = reportPath;
}

export function renderReportMarkdown(r: RunResult): string {
  const out: string[] = [];
  const statusIcon = r.status === "pass" ? "PASS" : r.status === "fail" ? "FAIL" : "SKIP";
  out.push(`# QA run: ${r.scenario}`);
  out.push("");
  out.push(`- **Status:** ${statusIcon}`);
  out.push(`- **Env:** \`${r.env}\``);
  out.push(`- **User:** \`${r.user}\``);
  out.push(`- **Started:** ${r.started_at}`);
  out.push(`- **Duration:** ${(r.duration_ms / 1000).toFixed(2)}s`);
  out.push(`- **Run ID:** \`${r.run_id}\``);
  if (r.scenario_path) out.push(`- **Scenario file:** \`${r.scenario_path}\``);
  out.push("");

  if (r.status === "fail" && r.fail_message) {
    out.push(`## Failure`);
    out.push("");
    out.push(`Step ${r.fail_step}: ${r.fail_message}`);
    out.push("");
  }

  out.push(`## Steps`);
  out.push("");
  out.push(`| # | Status | Kind | Description | Duration |`);
  out.push(`|---|--------|------|-------------|----------|`);
  for (const s of r.steps) {
    out.push(
      `| ${s.index} | ${statusCell(s)} | ${s.kind} | ${escapeCell(s.description)} | ${s.duration_ms}ms |`,
    );
  }
  out.push("");

  const failed = r.steps.filter((s) => s.status === "fail");
  if (failed.length > 0) {
    out.push(`## Failure details`);
    out.push("");
    for (const s of failed) {
      out.push(`### Step ${s.index}: ${s.description}`);
      out.push("");
      if (s.error) {
        out.push("```");
        out.push(s.error);
        out.push("```");
        out.push("");
      }
      for (const c of s.command_log) {
        out.push(`Command: \`${c.argv.slice(1).join(" ")}\` (exit ${c.exit_code})`);
        if (c.stderr.trim()) {
          out.push("");
          out.push("```");
          out.push(c.stderr.trim().slice(0, 2000));
          out.push("```");
        }
      }
      out.push("");
    }
  }

  out.push(`## Artifacts`);
  out.push("");
  out.push(`- Directory: \`${r.artifacts.dir}\``);
  if (r.artifacts.video) out.push(`- Video: \`${rel(r.artifacts.dir, r.artifacts.video)}\``);
  if (r.artifacts.har) out.push(`- HAR: \`${rel(r.artifacts.dir, r.artifacts.har)}\``);
  if (r.artifacts.console) out.push(`- Console: \`${rel(r.artifacts.dir, r.artifacts.console)}\``);
  if (r.artifacts.trace) out.push(`- Trace: \`${rel(r.artifacts.dir, r.artifacts.trace)}\``);
  out.push("");

  const screenshots = r.steps.flatMap((s) => (s.artifacts?.screenshot ? [s.artifacts.screenshot] : []));
  if (screenshots.length > 0) {
    out.push(`### Screenshots`);
    out.push("");
    for (const ss of screenshots) {
      out.push(`- \`${rel(r.artifacts.dir, ss)}\``);
    }
    out.push("");
  }

  return out.join("\n");
}

function statusCell(s: StepResult): string {
  if (s.status === "pass") return "PASS";
  if (s.status === "fail") return "FAIL";
  return "SKIP";
}

function escapeCell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function rel(base: string, p: string): string {
  return path.relative(base, p) || p;
}
