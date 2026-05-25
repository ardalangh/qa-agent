import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { findProjectRoot, projectPaths } from "./paths";
import {
  Environment,
  QaProject,
  RecordingPolicy,
  RunsConfig,
  Scenario,
  User,
} from "./types";

export const DEFAULT_RECORDING: RecordingPolicy = {
  video: "on-failure",
  har: "always",
  console: "always",
  trace: "off",
  snapshot: "per-step",
};

export interface LoadProjectOptions {
  cwd?: string;
  requireQaDir?: boolean;
}

export function loadProject(opts: LoadProjectOptions = {}): QaProject {
  const root = findProjectRoot(opts.cwd ?? process.cwd());
  const p = projectPaths(root);

  if (opts.requireQaDir !== false && !fs.existsSync(p.qaDir)) {
    throw new Error(
      `No qa/ directory found at ${p.qaDir}. Run \`npx qa-agent init\` to scaffold one.`,
    );
  }

  const users = loadUsers(p.usersFile);
  const { envs, envDefault } = loadEnvs(p.envsFile);
  const runsConfig = loadRunsConfig(p.runsConfigFile);

  return { root, users, envs, envDefault, runsConfig };
}

function loadUsers(file: string): User[] {
  if (!fs.existsSync(file)) return [];
  const doc = YAML.parse(fs.readFileSync(file, "utf8")) as { users?: User[] } | null;
  return doc?.users ?? [];
}

function loadEnvs(file: string): { envs: Environment[]; envDefault?: string } {
  if (!fs.existsSync(file)) return { envs: [] };
  const doc = YAML.parse(fs.readFileSync(file, "utf8")) as
    | { environments?: Record<string, Omit<Environment, "id">>; default?: string }
    | null;
  if (!doc?.environments) return { envs: [] };
  const envs: Environment[] = Object.entries(doc.environments).map(([id, body]) => ({
    id,
    baseUrl: body.baseUrl,
    provider: body.provider ?? null,
    config: body.config,
    allowedDomains: body.allowedDomains,
    headers: body.headers,
    requires_confirm: body.requires_confirm ?? false,
    recording: body.recording,
  }));
  return { envs, envDefault: doc.default };
}

function loadRunsConfig(file: string): RunsConfig | undefined {
  if (!fs.existsSync(file)) return undefined;
  const doc = YAML.parse(fs.readFileSync(file, "utf8")) as { storage?: RunsConfig } | null;
  return doc?.storage;
}

export function loadScenario(project: QaProject, name: string): Scenario {
  const p = projectPaths(project.root);
  const candidates = [
    path.join(p.scenariosDir, `${name}.yaml`),
    path.join(p.scenariosDir, `${name}.yml`),
    path.join(p.scenariosDir, name),
  ];
  const found = candidates.find((c) => fs.existsSync(c));
  if (!found) {
    throw new Error(`Scenario not found: ${name}. Looked in ${p.scenariosDir}/`);
  }
  const raw = fs.readFileSync(found, "utf8");
  const parsed = YAML.parse(raw) as Scenario;
  if (!parsed?.name || !Array.isArray(parsed.steps)) {
    throw new Error(`Scenario ${found} is invalid: missing 'name' or 'steps' array.`);
  }
  parsed.filePath = found;
  return parsed;
}

export function listScenarios(project: QaProject): string[] {
  const p = projectPaths(project.root);
  if (!fs.existsSync(p.scenariosDir)) return [];
  return fs
    .readdirSync(p.scenariosDir)
    .filter((f) => /\.(ya?ml)$/.test(f) && !f.startsWith("_"))
    .map((f) => f.replace(/\.(ya?ml)$/, ""))
    .sort();
}

export function resolveEnv(project: QaProject, requested?: string, scenario?: Scenario): Environment {
  const candidate =
    requested ??
    (typeof scenario?.requires?.env === "string" && scenario.requires.env !== "any"
      ? scenario.requires.env
      : undefined) ??
    project.envDefault ??
    project.envs[0]?.id;
  if (!candidate) throw new Error("No environments defined. Edit qa/environments.yaml.");
  const env = project.envs.find((e) => e.id === candidate);
  if (!env) {
    const known = project.envs.map((e) => e.id).join(", ") || "(none)";
    throw new Error(`Unknown env '${candidate}'. Known: ${known}`);
  }
  return env;
}

export function resolveUser(project: QaProject, requested?: string, scenario?: Scenario): User {
  const explicit = requested ?? scenario?.requires?.user_id ?? scenario?.requires?.user;
  if (explicit) {
    const byId = project.users.find((u) => u.id === explicit);
    if (byId) return byId;
    const byRole = project.users.find((u) => u.role === explicit);
    if (byRole) return byRole;
    throw new Error(`Unknown user or role '${explicit}'.`);
  }
  const role = scenario?.requires?.user_role;
  if (role) {
    const byRole = project.users.find((u) => u.role === role);
    if (byRole) return byRole;
    throw new Error(`No user with role '${role}' defined in qa/users.yaml.`);
  }
  if (project.users.length === 0) {
    return { id: "anon", role: "anonymous" };
  }
  return project.users[0];
}

export function effectiveRecording(env: Environment, scenario: Scenario): RecordingPolicy {
  return {
    ...DEFAULT_RECORDING,
    ...(env.recording ?? {}),
    ...(scenario.recording ?? {}),
  };
}

export function envBaseUrl(env: Environment): string {
  if (!env.baseUrl) throw new Error(`Environment ${env.id} has no baseUrl.`);
  return env.baseUrl.replace(/\/+$/, "");
}

export function substituteVars(input: string, ctx: { baseUrl: string; env: string; user: string }): string {
  return input
    .replaceAll("{baseUrl}", ctx.baseUrl)
    .replaceAll("{env}", ctx.env)
    .replaceAll("{user}", ctx.user);
}
