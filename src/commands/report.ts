import fs from "node:fs";
import path from "node:path";
import pc from "picocolors";
import { loadProject } from "../lib/config";
import { projectPaths } from "../lib/paths";
import { readIndex } from "../lib/summary";

export interface ReportOptions {
  json?: boolean;
}

export async function report(runId: string | undefined, opts: ReportOptions): Promise<void> {
  const project = loadProject({ requireQaDir: false });
  const p = projectPaths(project.root);

  let targetRunId = runId;

  if (!targetRunId) {
    // Try to use latest symlink
    const latestPath = path.join(p.runsDir, "latest");
    if (fs.existsSync(latestPath)) {
      const stat = fs.lstatSync(latestPath);
      if (stat.isSymbolicLink()) {
        targetRunId = fs.readlinkSync(latestPath);
      } else if (stat.isDirectory()) {
        targetRunId = "latest";
      }
    }

    // Fall back to most recent from index
    if (!targetRunId) {
      const entries = readIndex(project.root);
      if (entries.length > 0) {
        entries.sort((a, b) => (a.started_at < b.started_at ? 1 : -1));
        targetRunId = entries[0].run_id;
      }
    }
  }

  if (!targetRunId) {
    console.log(pc.yellow("No runs found."));
    return;
  }

  const runDir = path.join(p.runsDir, targetRunId);
  const resultPath = path.join(runDir, "result.json");
  const reportPath = path.join(runDir, "report.md");

  if (!fs.existsSync(runDir)) {
    console.log(pc.red(`Run not found: ${targetRunId}`));
    return;
  }

  if (opts.json) {
    if (fs.existsSync(resultPath)) {
      const result = JSON.parse(fs.readFileSync(resultPath, "utf8"));
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(pc.yellow("result.json not found for this run."));
    }
    return;
  }

  if (fs.existsSync(reportPath)) {
    const report = fs.readFileSync(reportPath, "utf8");
    console.log(report);
  } else {
    console.log(pc.yellow("report.md not found for this run."));
    console.log(`Run directory: ${runDir}`);
  }
}
