import fs from "node:fs";
import path from "node:path";
import pc from "picocolors";
import { loadProject } from "../lib/config";
import { projectPaths } from "../lib/paths";
import { readIndex, rewriteIndex, rebuildSummary, IndexEntry } from "../lib/summary";

export interface CleanOptions {
  keepLast?: string;
  olderThan?: string;
  dryRun?: boolean;
}

export async function clean(opts: CleanOptions): Promise<void> {
  const project = loadProject({ requireQaDir: false });
  const p = projectPaths(project.root);

  let entries = readIndex(project.root);
  if (entries.length === 0) {
    console.log(pc.yellow("No runs to clean."));
    return;
  }

  // Sort by date descending
  entries.sort((a, b) => (a.started_at < b.started_at ? 1 : -1));

  const toRemove: IndexEntry[] = [];
  const toKeep: IndexEntry[] = [];

  if (opts.keepLast) {
    const keepCount = parseInt(opts.keepLast, 10);
    for (let i = 0; i < entries.length; i++) {
      if (i < keepCount) {
        toKeep.push(entries[i]);
      } else {
        toRemove.push(entries[i]);
      }
    }
  } else if (opts.olderThan) {
    const days = parseInt(opts.olderThan, 10);
    const cutoff = Date.now() - days * 24 * 3600 * 1000;
    for (const entry of entries) {
      if (new Date(entry.started_at).getTime() < cutoff) {
        toRemove.push(entry);
      } else {
        toKeep.push(entry);
      }
    }
  } else {
    // Default: keep last 50 runs
    for (let i = 0; i < entries.length; i++) {
      if (i < 50) {
        toKeep.push(entries[i]);
      } else {
        toRemove.push(entries[i]);
      }
    }
  }

  if (toRemove.length === 0) {
    console.log(pc.green("Nothing to clean."));
    return;
  }

  if (opts.dryRun) {
    console.log(pc.cyan(`Would remove ${toRemove.length} run(s):`));
    for (const entry of toRemove) {
      console.log(`  ${entry.run_id}`);
    }
    return;
  }

  console.log(pc.cyan(`Removing ${toRemove.length} run(s)...`));
  let removed = 0;

  for (const entry of toRemove) {
    const runDir = path.join(p.runsDir, entry.run_id);
    if (fs.existsSync(runDir)) {
      try {
        fs.rmSync(runDir, { recursive: true, force: true });
        removed++;
        console.log(pc.dim(`  Removed: ${entry.run_id}`));
      } catch (err) {
        console.log(pc.yellow(`  Failed to remove: ${entry.run_id}`));
      }
    }
  }

  // Update index
  rewriteIndex(project.root, toKeep);
  rebuildSummary(project.root);

  console.log(pc.green(`✓ Removed ${removed} run(s), kept ${toKeep.length}.`));
}
