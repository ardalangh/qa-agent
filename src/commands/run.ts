import fs from "node:fs";
import path from "node:path";
import pc from "picocolors";
import {
  loadProject,
  loadScenario,
  resolveEnv,
  resolveUser,
  effectiveRecording,
  envBaseUrl,
} from "../lib/config";
import { compileScenario, CompiledStep, AssertionOutcome } from "../lib/compiler";
import { AgentBrowserOptions, runAgentBrowser, closeSession } from "../lib/agentBrowser";
import { createRecorder } from "../lib/recorder";
import { writeRunArtifacts } from "../lib/reporter";
import { appendIndex, rebuildSummary } from "../lib/summary";
import { projectPaths, ensureDir } from "../lib/paths";
import { generateRunId } from "../lib/runId";
import { RunResult, StepResult, StepStatus, CommandLogEntry } from "../lib/types";

export interface RunOptions {
  env?: string;
  user?: string;
  headed?: boolean;
  json?: boolean;
}

export async function run(scenarioName: string, opts: RunOptions): Promise<void> {
  const project = loadProject();
  const scenario = loadScenario(project, scenarioName);
  const env = resolveEnv(project, opts.env, scenario);
  const user = resolveUser(project, opts.user, scenario);
  const baseUrl = envBaseUrl(env);
  const recording = effectiveRecording(env, scenario);

  const runId = generateRunId(scenario.name, env.id, user.id);
  const p = projectPaths(project.root);
  const runDir = path.join(p.runsDir, runId);
  ensureDir(runDir);
  ensureDir(path.join(runDir, "screenshots"));
  ensureDir(path.join(runDir, "snapshots"));

  const startedAt = new Date();

  if (!opts.json) {
    console.log(pc.cyan(`Running: ${pc.bold(scenario.name)}`));
    console.log(`  Env: ${env.id} (${baseUrl})`);
    console.log(`  User: ${user.id}${user.role ? ` (${user.role})` : ""}`);
    console.log(`  Run ID: ${runId}`);
    console.log("");
  }

  const abOpts: AgentBrowserOptions = {
    session: `qa-${user.id}-${Date.now()}`,
    configFile: env.config ? path.join(project.root, env.config) : undefined,
    provider: env.provider ?? undefined,
    headed: opts.headed,
  };

  const recorder = createRecorder({
    abOpts,
    runDir,
    policy: recording,
  });

  const ctx = { baseUrl, env: env.id, user: user.id };
  const compiledSteps = compileScenario(scenario, ctx);

  const stepResults: StepResult[] = [];
  let overallStatus: StepStatus = "pass";
  let failStep: number | undefined;
  let failMessage: string | undefined;

  try {
    // Start recording
    await recorder.start();

    // Handle setup: login if needed
    if (scenario.setup?.some((s) => s.login)) {
      await handleLogin(abOpts, user, baseUrl);
    }

    // Set viewport if specified
    if (scenario.viewport) {
      await runAgentBrowser(abOpts, ["set", "viewport", String(scenario.viewport.w), String(scenario.viewport.h)]);
    }

    // Execute steps
    for (const step of compiledSteps) {
      const stepStarted = Date.now();
      const commandLog: CommandLogEntry[] = [];
      let stepStatus: StepStatus = "pass";
      let stepError: string | undefined;

      if (!opts.json) {
        process.stdout.write(`  [${step.index}] ${step.description}... `);
      }

      for (const cmd of step.commands) {
        const result = await runAgentBrowser(abOpts, cmd.argv, {
          jsonOutput: cmd.jsonOutput,
          timeoutMs: 60000,
        });
        commandLog.push(result);

        if (result.exit_code !== 0 && !cmd.evaluate) {
          stepStatus = "fail";
          stepError = result.stderr || `Command exited with ${result.exit_code}`;
          break;
        }

        if (cmd.evaluate) {
          const outcome = cmd.evaluate(result.json, result.stdout, result.exit_code);
          if (outcome && !outcome.pass) {
            stepStatus = "fail";
            stepError = outcome.message || "Assertion failed";
            break;
          }
        }
      }

      // Capture per-step artifacts if policy allows
      const artifacts: StepResult["artifacts"] = {};
      if (recording.snapshot === "per-step" || recording.snapshot === "always") {
        const snapPath = path.join(runDir, "snapshots", `${String(step.index).padStart(2, "0")}-${slugify(step.description)}.json`);
        const snapResult = await runAgentBrowser(abOpts, ["snapshot", "-i"], { jsonOutput: true });
        if (snapResult.exit_code === 0) {
          fs.writeFileSync(snapPath, snapResult.json ? JSON.stringify(snapResult.json, null, 2) : snapResult.stdout);
          artifacts.snapshot = snapPath;
        }
      }

      const ssPath = path.join(runDir, "screenshots", `${String(step.index).padStart(2, "0")}-${slugify(step.description)}.png`);
      const ssResult = await runAgentBrowser(abOpts, ["screenshot", ssPath]);
      if (ssResult.exit_code === 0) {
        artifacts.screenshot = ssPath;
      }

      const stepDuration = Date.now() - stepStarted;
      stepResults.push({
        index: step.index,
        description: step.description,
        kind: step.kind,
        status: stepStatus,
        started_at: new Date(stepStarted).toISOString(),
        duration_ms: stepDuration,
        error: stepError,
        artifacts,
        command_log: commandLog,
      });

      if (!opts.json) {
        if (stepStatus === "pass") {
          console.log(pc.green("✓"));
        } else {
          console.log(pc.red("✗"));
          if (stepError) {
            console.log(pc.red(`     ${stepError}`));
          }
        }
      }

      if (stepStatus === "fail") {
        overallStatus = "fail";
        failStep = step.index;
        failMessage = stepError;

        // Capture failure screenshot
        const failSsPath = path.join(runDir, "screenshots", "99-failure.png");
        await runAgentBrowser(abOpts, ["screenshot", "--annotate", failSsPath]);
        break;
      }
    }
  } catch (err) {
    overallStatus = "fail";
    failMessage = (err as Error).message;
  } finally {
    // Stop recording and close session
    const recorderArtifacts = await recorder.stop();
    await closeSession(abOpts.session);

    const finishedAt = new Date();
    const duration = finishedAt.getTime() - startedAt.getTime();

    const runResult: RunResult = {
      run_id: runId,
      scenario: scenario.name,
      scenario_path: scenario.filePath,
      env: env.id,
      user: user.id,
      started_at: startedAt.toISOString(),
      finished_at: finishedAt.toISOString(),
      duration_ms: duration,
      status: overallStatus,
      fail_step: failStep,
      fail_message: failMessage,
      steps: stepResults,
      artifacts: {
        dir: runDir,
        video: recorderArtifacts.video,
        har: recorderArtifacts.har,
        console: recorderArtifacts.console,
        trace: recorderArtifacts.trace,
      },
    };

    writeRunArtifacts(runDir, runResult);
    appendIndex(project.root, runResult);
    rebuildSummary(project.root);

    if (opts.json) {
      console.log(JSON.stringify(runResult, null, 2));
    } else {
      console.log("");
      if (overallStatus === "pass") {
        console.log(pc.green(`✓ ${scenario.name} passed in ${(duration / 1000).toFixed(2)}s`));
      } else {
        console.log(pc.red(`✗ ${scenario.name} failed at step ${failStep}`));
      }
      console.log(`  Report: ${runResult.artifacts.report}`);
      console.log(`  Summary: ${path.join(p.runsDir, "SUMMARY.md")}`);
    }
  }
}

async function handleLogin(abOpts: AgentBrowserOptions, user: { id: string; auth_vault?: string; state_file?: string; email?: string; password_env?: string }, baseUrl: string): Promise<void> {
  if (user.state_file) {
    await runAgentBrowser(abOpts, ["state", "load", user.state_file]);
    return;
  }
  if (user.auth_vault) {
    await runAgentBrowser(abOpts, ["auth", "login", user.auth_vault]);
    return;
  }
  // If email and password_env are provided, we'd need to do a form-based login
  // For now, just open the base URL
  await runAgentBrowser(abOpts, ["open", baseUrl]);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
