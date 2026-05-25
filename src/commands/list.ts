import pc from "picocolors";
import { loadProject, listScenarios } from "../lib/config";

export interface ListOptions {
  scenarios?: boolean;
  users?: boolean;
  envs?: boolean;
  json?: boolean;
}

const PLACEHOLDER_PATTERNS = [
  /example\.com/i,
  /example-cdn\.com/i,
  /@example\./i,
  /your-.*\.com/i,
  /placeholder/i,
  /changeme/i,
  /todo/i,
];

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return false;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
}

function highlightPlaceholder(value: string): string {
  if (isPlaceholder(value)) {
    return pc.yellow(value) + pc.dim(" (placeholder)");
  }
  return value;
}

export async function list(opts: ListOptions): Promise<void> {
  const project = loadProject({ requireQaDir: false });

  const showAll = !opts.scenarios && !opts.users && !opts.envs;

  const data: {
    scenarios?: string[];
    users?: Array<{ id: string; role?: string; email?: string }>;
    envs?: Array<{ id: string; baseUrl: string; provider?: string | null }>;
  } = {};

  if (showAll || opts.scenarios) {
    data.scenarios = listScenarios(project);
  }

  if (showAll || opts.users) {
    data.users = project.users.map((u) => ({
      id: u.id,
      role: u.role,
      email: u.email,
    }));
  }

  if (showAll || opts.envs) {
    data.envs = project.envs.map((e) => ({
      id: e.id,
      baseUrl: e.baseUrl,
      provider: e.provider,
    }));
  }

  if (opts.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (data.scenarios !== undefined) {
    console.log(pc.cyan("Scenarios:"));
    if (data.scenarios.length === 0) {
      console.log(pc.dim("  (none)"));
    } else {
      for (const s of data.scenarios) {
        console.log(`  - ${s}`);
      }
    }
    console.log("");
  }

  if (data.users !== undefined) {
    console.log(pc.cyan("Users:"));
    if (data.users.length === 0) {
      console.log(pc.dim("  (none)"));
    } else {
      for (const u of data.users) {
        const parts = [u.id];
        if (u.role) parts.push(`role=${u.role}`);
        if (u.email) parts.push(`email=${highlightPlaceholder(u.email ?? "")}`);
        console.log(`  - ${parts.join(", ")}`);
      }
    }
    console.log("");
  }

  if (data.envs !== undefined) {
    console.log(pc.cyan("Environments:"));
    if (data.envs.length === 0) {
      console.log(pc.dim("  (none)"));
    } else {
      for (const e of data.envs) {
        const providerInfo = e.provider ? ` (${e.provider})` : "";
        const urlDisplay = highlightPlaceholder(e.baseUrl);
        console.log(`  - ${e.id}: ${urlDisplay}${providerInfo}`);
      }
    }
    console.log("");
  }

  // Show informational message about placeholders
  const placeholderUsers = data.users?.filter((u) => isPlaceholder(u.email)) ?? [];
  const placeholderEnvs = data.envs?.filter((e) => isPlaceholder(e.baseUrl)) ?? [];

  if (placeholderUsers.length > 0 || placeholderEnvs.length > 0) {
    console.log(pc.yellow("⚠ Some values appear to be placeholders."));
    console.log(pc.dim("  Edit qa/users.yaml and qa/envs.yaml to update them."));
  }
}
