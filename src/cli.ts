#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";

const program = new Command();

program
  .name("qa-agent")
  .description("Reusable QA agent for Cursor and Claude Code")
  .version("0.1.1");

program
  .command("init")
  .description("Install QA agent assets into the current project")
  .option("--cursor", "Install for Cursor only")
  .option("--claude", "Install for Claude Code only")
  .option("-y, --yes", "Non-interactive mode, accept defaults")
  .option("--cwd", "Use current directory as project root (don't walk up)")
  .action(async (opts) => {
    const { init } = await import("./commands/init");
    await init(opts);
  });

program
  .command("update")
  .description("Update QA agent assets to the latest version")
  .option("--cursor", "Update Cursor assets only")
  .option("--claude", "Update Claude Code assets only")
  .action(async (opts) => {
    const { update } = await import("./commands/update");
    await update(opts);
  });

program
  .command("doctor")
  .description("Check QA agent and agent-browser installation")
  .action(async () => {
    const { doctor } = await import("./commands/doctor");
    await doctor();
  });

program
  .command("run <scenario>")
  .description("Run a QA scenario")
  .option("-e, --env <env>", "Environment to run against")
  .option("-u, --user <user>", "User ID or role to run as")
  .option("--headed", "Run in headed mode (visible browser)")
  .option("--json", "Output result as JSON")
  .action(async (scenario, opts) => {
    const { run } = await import("./commands/run");
    await run(scenario, opts);
  });

program
  .command("runs")
  .description("List past QA runs")
  .option("-n, --last <n>", "Show last N runs", "10")
  .option("-s, --scenario <scenario>", "Filter by scenario")
  .option("-e, --env <env>", "Filter by environment")
  .option("-u, --user <user>", "Filter by user")
  .option("--failed", "Show only failed runs")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const { runs } = await import("./commands/runs");
    await runs(opts);
  });

program
  .command("trend")
  .description("Show pass rate trends")
  .option("-d, --days <days>", "Number of days to analyze", "30")
  .option("-s, --scenario <scenario>", "Filter by scenario")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const { trend } = await import("./commands/trend");
    await trend(opts);
  });

program
  .command("report [runId]")
  .description("Show or open a run report")
  .option("--json", "Output report data as JSON")
  .action(async (runId, opts) => {
    const { report } = await import("./commands/report");
    await report(runId, opts);
  });

program
  .command("clean")
  .description("Clean old run artifacts")
  .option("-n, --keep-last <n>", "Keep last N runs")
  .option("--older-than <days>", "Remove runs older than N days")
  .option("--dry-run", "Show what would be removed without removing")
  .action(async (opts) => {
    const { clean } = await import("./commands/clean");
    await clean(opts);
  });

program
  .command("list")
  .description("List scenarios, users, and environments")
  .option("--scenarios", "List scenarios only")
  .option("--users", "List users only")
  .option("--envs", "List environments only")
  .option("--json", "Output as JSON")
  .option("--no-prompt", "Don't prompt to edit placeholder values")
  .action(async (opts) => {
    const { list } = await import("./commands/list");
    await list(opts);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(pc.red("Error:"), err.message);
  process.exit(1);
});
