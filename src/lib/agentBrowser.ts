import { spawn, spawnSync } from "node:child_process";
import { CommandLogEntry } from "./types";

export interface AgentBrowserOptions {
  session: string;
  configFile?: string;
  provider?: string | null;
  headed?: boolean;
  extraGlobalArgs?: string[];
}

export interface RunCmdResult extends CommandLogEntry {}

function agentBrowserBin(): string {
  return process.env.QA_AGENT_BROWSER_BIN || "agent-browser";
}

function buildGlobalArgs(opts: AgentBrowserOptions): string[] {
  const args: string[] = [];
  args.push("--session", opts.session);
  if (opts.configFile) args.push("--config", opts.configFile);
  if (opts.provider) args.push("-p", opts.provider);
  if (opts.headed) args.push("--headed");
  if (opts.extraGlobalArgs) args.push(...opts.extraGlobalArgs);
  return args;
}

export function isAgentBrowserAvailable(): { ok: boolean; version?: string; error?: string } {
  try {
    const result = spawnSync(agentBrowserBin(), ["--version"], { encoding: "utf8" });
    if (result.error) return { ok: false, error: result.error.message };
    if (result.status !== 0) return { ok: false, error: result.stderr || `exit ${result.status}` };
    return { ok: true, version: (result.stdout || result.stderr).trim() };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export interface RunCmdOptions {
  jsonOutput?: boolean;
  timeoutMs?: number;
  stdin?: string;
}

export async function runAgentBrowser(
  abOpts: AgentBrowserOptions,
  argv: string[],
  opts: RunCmdOptions = {},
): Promise<RunCmdResult> {
  const bin = agentBrowserBin();
  const fullArgs = [...buildGlobalArgs(abOpts), ...argv];
  if (opts.jsonOutput && !fullArgs.includes("--json")) fullArgs.push("--json");
  const started = Date.now();
  return new Promise<RunCmdResult>((resolve) => {
    const child = spawn(bin, fullArgs, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let killed = false;
    const timer = opts.timeoutMs
      ? setTimeout(() => {
          killed = true;
          child.kill("SIGTERM");
        }, opts.timeoutMs)
      : null;
    child.stdout.on("data", (b) => (stdout += b.toString()));
    child.stderr.on("data", (b) => (stderr += b.toString()));
    if (opts.stdin) {
      child.stdin.write(opts.stdin);
      child.stdin.end();
    } else {
      child.stdin.end();
    }
    child.on("error", (err) => {
      if (timer) clearTimeout(timer);
      resolve({
        argv: [bin, ...fullArgs],
        exit_code: 127,
        stdout,
        stderr: stderr + `\n[spawn-error] ${err.message}`,
        duration_ms: Date.now() - started,
      });
    });
    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      const exit = killed ? 124 : code ?? 1;
      let json: unknown | undefined;
      if (opts.jsonOutput) {
        const trimmed = stdout.trim();
        if (trimmed) {
          try {
            json = JSON.parse(trimmed);
          } catch {
            const lastBrace = trimmed.lastIndexOf("{");
            const lastBracket = trimmed.lastIndexOf("[");
            const start = Math.max(lastBrace, lastBracket);
            if (start >= 0) {
              try {
                json = JSON.parse(trimmed.slice(start));
              } catch {
                /* leave json undefined */
              }
            }
          }
        }
      }
      resolve({
        argv: [bin, ...fullArgs],
        exit_code: exit,
        stdout,
        stderr,
        json,
        duration_ms: Date.now() - started,
      });
    });
  });
}

export async function closeSession(session: string): Promise<void> {
  await runAgentBrowser({ session }, ["close"], { timeoutMs: 10000 });
}
