import fs from "node:fs";
import path from "node:path";
import pc from "picocolors";
import prompts from "prompts";
import { findProjectRoot, projectPaths, assetsRoot, templatesRoot, ensureDir } from "../lib/paths";
import { isAgentBrowserAvailable } from "../lib/agentBrowser";

export interface InitOptions {
  cursor?: boolean;
  claude?: boolean;
  yes?: boolean;
  findRoot?: boolean;
}

export async function init(opts: InitOptions): Promise<void> {
  // Default to current directory for init (use --find-root to walk up and find project root)
  const root = opts.findRoot ? findProjectRoot() : process.cwd();
  console.log(pc.cyan("QA Agent Init"));
  console.log(`Project root: ${pc.bold(root)}`);

  let installCursor = opts.cursor || (!opts.cursor && !opts.claude);
  let installClaude = opts.claude || (!opts.cursor && !opts.claude);

  // Skip interactive prompts if not in a TTY or --yes is provided
  if (!opts.yes && !opts.cursor && !opts.claude && process.stdin.isTTY) {
    const response = await prompts({
      type: "multiselect",
      name: "targets",
      message: "Install for which platforms?",
      choices: [
        { title: "Cursor", value: "cursor", selected: true },
        { title: "Claude Code", value: "claude", selected: true },
      ],
      min: 1,
    });
    if (!response.targets || response.targets.length === 0) {
      console.log(pc.yellow("Cancelled."));
      return;
    }
    installCursor = response.targets.includes("cursor");
    installClaude = response.targets.includes("claude");
  }

  const p = projectPaths(root);
  const assets = assetsRoot();
  const templates = templatesRoot();

  if (installCursor) {
    console.log(pc.dim("Installing Cursor assets..."));
    copySkills(assets, p.cursorSkillsDir);
    copyRules(assets, p.cursorRulesDir);
    copyCommands(assets, p.cursorCommandsDir);
  }

  if (installClaude) {
    console.log(pc.dim("Installing Claude Code assets..."));
    copySkills(assets, p.claudeSkillsDir);
    copyCommands(assets, p.claudeCommandsDir);
    appendClaudePointer(root, assets);
  }

  console.log(pc.dim("Scaffolding qa/ directory..."));
  scaffoldQaDir(p, templates);

  console.log(pc.dim("Checking agent-browser..."));
  const ab = isAgentBrowserAvailable();
  if (ab.ok) {
    console.log(pc.green(`✓ agent-browser ${ab.version} found`));
  } else {
    console.log(pc.yellow(`⚠ agent-browser not found: ${ab.error}`));
    console.log(pc.dim("  Install with: npm i -g agent-browser && agent-browser install"));
  }

  console.log("");
  console.log(pc.green("✓ QA Agent installed!"));
  console.log("");
  console.log("Next steps:");
  console.log(`  1. Edit ${pc.bold("qa/users.yaml")} to define test users`);
  console.log(`  2. Edit ${pc.bold("qa/environments.yaml")} to define environments`);
  console.log(`  3. Create scenarios in ${pc.bold("qa/scenarios/")}`);
  console.log("");
  console.log("Available slash commands:");
  console.log(`  ${pc.cyan("/qa-run")} <scenario> - Run a scenario`);
  console.log(`  ${pc.cyan("/qa-list")} - List scenarios, users, envs`);
  console.log(`  ${pc.cyan("/qa-new")} - Create a new scenario interactively`);
  console.log(`  ${pc.cyan("/qa-report")} - View the latest run report`);
}

function copySkills(assetsDir: string, targetDir: string): void {
  const srcSkills = path.join(assetsDir, "skills");
  if (!fs.existsSync(srcSkills)) return;
  ensureDir(targetDir);
  for (const skill of fs.readdirSync(srcSkills)) {
    const srcPath = path.join(srcSkills, skill);
    const destPath = path.join(targetDir, skill);
    copyDirRecursive(srcPath, destPath);
  }
}

function copyRules(assetsDir: string, targetDir: string): void {
  const srcRules = path.join(assetsDir, "rules");
  if (!fs.existsSync(srcRules)) return;
  ensureDir(targetDir);
  for (const file of fs.readdirSync(srcRules)) {
    if (file.endsWith(".mdc")) {
      const src = path.join(srcRules, file);
      const dest = path.join(targetDir, file);
      fs.copyFileSync(src, dest);
    }
  }
}

function copyCommands(assetsDir: string, targetDir: string): void {
  const srcCommands = path.join(assetsDir, "commands");
  if (!fs.existsSync(srcCommands)) return;
  ensureDir(targetDir);
  for (const file of fs.readdirSync(srcCommands)) {
    if (file.endsWith(".md")) {
      const src = path.join(srcCommands, file);
      const dest = path.join(targetDir, file);
      fs.copyFileSync(src, dest);
    }
  }
}

function appendClaudePointer(root: string, assetsDir: string): void {
  const pointerSrc = path.join(assetsDir, "claude-pointer.md");
  if (!fs.existsSync(pointerSrc)) return;
  const pointer = fs.readFileSync(pointerSrc, "utf8");

  for (const filename of ["CLAUDE.md", "AGENTS.md"]) {
    const targetFile = path.join(root, filename);
    if (fs.existsSync(targetFile)) {
      const existing = fs.readFileSync(targetFile, "utf8");
      if (!existing.includes("## QA Agent")) {
        fs.appendFileSync(targetFile, "\n" + pointer);
        console.log(pc.dim(`  Appended QA Agent section to ${filename}`));
      }
      return;
    }
  }
  const claudeFile = path.join(root, ".claude", "CLAUDE.md");
  ensureDir(path.dirname(claudeFile));
  fs.writeFileSync(claudeFile, pointer, "utf8");
  console.log(pc.dim("  Created .claude/CLAUDE.md"));
}

function scaffoldQaDir(p: ReturnType<typeof projectPaths>, templatesDir: string): void {
  ensureDir(p.qaDir);
  ensureDir(p.scenariosDir);
  ensureDir(p.runsDir);

  const filesToCopy = [
    { src: "users.yaml.example", dest: "users.yaml" },
    { src: "environments.yaml.example", dest: "environments.yaml" },
    { src: "agent-browser.json.example", dest: "agent-browser.json" },
    { src: "runs.config.yaml.example", dest: "runs.config.yaml" },
    { src: "gitignore.example", dest: ".gitignore" },
  ];

  for (const { src, dest } of filesToCopy) {
    const srcPath = path.join(templatesDir, src);
    const destPath = path.join(p.qaDir, dest);
    if (!fs.existsSync(destPath) && fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(pc.dim(`  Created qa/${dest}`));
    }
  }

  const exampleScenario = path.join(templatesDir, "scenarios", "_example.yaml");
  const destScenario = path.join(p.scenariosDir, "_example.yaml");
  if (!fs.existsSync(destScenario) && fs.existsSync(exampleScenario)) {
    fs.copyFileSync(exampleScenario, destScenario);
    console.log(pc.dim("  Created qa/scenarios/_example.yaml"));
  }
}

function copyDirRecursive(src: string, dest: string): void {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
