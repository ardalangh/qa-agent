import pc from "picocolors";
import prompts from "prompts";
import { loadProject, listScenarios } from "../lib/config";
import { projectPaths } from "../lib/paths";
import { editConfig, type ConfigEdit } from "../lib/configEditor";

export interface ListOptions {
  scenarios?: boolean;
  users?: boolean;
  envs?: boolean;
  json?: boolean;
  prompt?: boolean; // false when --no-prompt is passed
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

  // Check for placeholders and offer to edit (skip if --no-prompt)
  if (opts.prompt === false) return;

  const placeholderUsers = data.users?.filter((u) => isPlaceholder(u.email)) ?? [];
  const placeholderEnvs = data.envs?.filter((e) => isPlaceholder(e.baseUrl)) ?? [];

  if (placeholderUsers.length > 0 || placeholderEnvs.length > 0) {
    console.log(pc.yellow("⚠ Some values appear to be placeholders."));

    const { shouldEdit } = await prompts({
      type: "confirm",
      name: "shouldEdit",
      message: "Would you like to update them now?",
      initial: true,
    });

    if (shouldEdit) {
      const paths = projectPaths(project.root);
      const edits: ConfigEdit[] = [];

      // Prompt for user email updates
      for (const u of placeholderUsers) {
        const { newEmail } = await prompts({
          type: "text",
          name: "newEmail",
          message: `Enter email for user "${u.id}" (current: ${u.email}):`,
          initial: "",
        });
        if (newEmail && newEmail !== u.email) {
          edits.push({
            file: paths.usersFile,
            type: "user",
            id: u.id,
            field: "email",
            oldValue: u.email!,
            newValue: newEmail,
          });
        }
      }

      // Prompt for environment URL updates
      for (const e of placeholderEnvs) {
        const { newUrl } = await prompts({
          type: "text",
          name: "newUrl",
          message: `Enter baseUrl for env "${e.id}" (current: ${e.baseUrl}):`,
          initial: "",
        });
        if (newUrl && newUrl !== e.baseUrl) {
          edits.push({
            file: paths.envsFile,
            type: "env",
            id: e.id,
            field: "baseUrl",
            oldValue: e.baseUrl,
            newValue: newUrl,
          });
        }
      }

      if (edits.length > 0) {
        await editConfig(edits);
        console.log(pc.green(`✓ Updated ${edits.length} value(s).`));
      } else {
        console.log(pc.dim("No changes made."));
      }
    }
  }
}
