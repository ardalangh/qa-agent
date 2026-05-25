import path from "node:path";
import fs from "node:fs";

export interface ProjectPaths {
  root: string;
  qaDir: string;
  scenariosDir: string;
  runsDir: string;
  secretsDir: string;
  usersFile: string;
  envsFile: string;
  runsConfigFile: string;
  agentBrowserConfigFile: string;
  cursorDir: string;
  cursorSkillsDir: string;
  cursorRulesDir: string;
  cursorCommandsDir: string;
  claudeDir: string;
  claudeSkillsDir: string;
  claudeCommandsDir: string;
}

export function projectPaths(root: string): ProjectPaths {
  const qaDir = path.join(root, "qa");
  return {
    root,
    qaDir,
    scenariosDir: path.join(qaDir, "scenarios"),
    runsDir: path.join(qaDir, "runs"),
    secretsDir: path.join(qaDir, ".secrets"),
    usersFile: path.join(qaDir, "users.yaml"),
    envsFile: path.join(qaDir, "environments.yaml"),
    runsConfigFile: path.join(qaDir, "runs.config.yaml"),
    agentBrowserConfigFile: path.join(qaDir, "agent-browser.json"),
    cursorDir: path.join(root, ".cursor"),
    cursorSkillsDir: path.join(root, ".cursor", "skills"),
    cursorRulesDir: path.join(root, ".cursor", "rules"),
    cursorCommandsDir: path.join(root, ".cursor", "commands"),
    claudeDir: path.join(root, ".claude"),
    claudeSkillsDir: path.join(root, ".claude", "skills"),
    claudeCommandsDir: path.join(root, ".claude", "commands"),
  };
}

export function findProjectRoot(start: string = process.cwd()): string {
  let cur = path.resolve(start);
  for (let i = 0; i < 8; i++) {
    if (
      fs.existsSync(path.join(cur, "package.json")) ||
      fs.existsSync(path.join(cur, "pyproject.toml")) ||
      fs.existsSync(path.join(cur, ".git"))
    ) {
      return cur;
    }
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return path.resolve(start);
}

export function packageRoot(): string {
  return path.resolve(__dirname, "..", "..");
}

export function assetsRoot(): string {
  return path.join(packageRoot(), "assets");
}

export function templatesRoot(): string {
  return path.join(packageRoot(), "templates");
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}
