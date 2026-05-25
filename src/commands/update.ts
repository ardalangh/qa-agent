import fs from "node:fs";
import path from "node:path";
import pc from "picocolors";
import { findProjectRoot, projectPaths, assetsRoot, ensureDir } from "../lib/paths";

export interface UpdateOptions {
  cursor?: boolean;
  claude?: boolean;
  findRoot?: boolean;
}

export async function update(opts: UpdateOptions): Promise<void> {
  // Default to current directory (use --find-root to walk up and find project root)
  const root = opts.findRoot ? findProjectRoot() : process.cwd();
  console.log(pc.cyan("QA Agent Update"));
  console.log(`Project root: ${pc.bold(root)}`);

  const updateCursor = opts.cursor || (!opts.cursor && !opts.claude);
  const updateClaude = opts.claude || (!opts.cursor && !opts.claude);

  const p = projectPaths(root);
  const assets = assetsRoot();

  if (updateCursor) {
    console.log(pc.dim("Updating Cursor assets..."));
    updateSkills(assets, p.cursorSkillsDir);
    updateRules(assets, p.cursorRulesDir);
    updateCommands(assets, p.cursorCommandsDir);
  }

  if (updateClaude) {
    console.log(pc.dim("Updating Claude Code assets..."));
    updateSkills(assets, p.claudeSkillsDir);
    updateCommands(assets, p.claudeCommandsDir);
  }

  console.log(pc.green("✓ QA Agent assets updated!"));
}

function updateSkills(assetsDir: string, targetDir: string): void {
  const srcSkills = path.join(assetsDir, "skills");
  if (!fs.existsSync(srcSkills)) return;
  ensureDir(targetDir);
  for (const skill of fs.readdirSync(srcSkills)) {
    if (!skill.startsWith("qa-")) continue;
    const srcPath = path.join(srcSkills, skill);
    const destPath = path.join(targetDir, skill);
    copyDirRecursive(srcPath, destPath);
    console.log(pc.dim(`  Updated skill: ${skill}`));
  }
}

function updateRules(assetsDir: string, targetDir: string): void {
  const srcRules = path.join(assetsDir, "rules");
  if (!fs.existsSync(srcRules)) return;
  ensureDir(targetDir);
  for (const file of fs.readdirSync(srcRules)) {
    if (file.startsWith("qa-") && file.endsWith(".mdc")) {
      const src = path.join(srcRules, file);
      const dest = path.join(targetDir, file);
      fs.copyFileSync(src, dest);
      console.log(pc.dim(`  Updated rule: ${file}`));
    }
  }
}

function updateCommands(assetsDir: string, targetDir: string): void {
  const srcCommands = path.join(assetsDir, "commands");
  if (!fs.existsSync(srcCommands)) return;
  ensureDir(targetDir);
  for (const file of fs.readdirSync(srcCommands)) {
    if (file.startsWith("qa-") && file.endsWith(".md")) {
      const src = path.join(srcCommands, file);
      const dest = path.join(targetDir, file);
      fs.copyFileSync(src, dest);
      console.log(pc.dim(`  Updated command: ${file}`));
    }
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
