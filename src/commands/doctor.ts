import fs from "node:fs";
import pc from "picocolors";
import { findProjectRoot, projectPaths } from "../lib/paths";
import { isAgentBrowserAvailable } from "../lib/agentBrowser";

export async function doctor(): Promise<void> {
  console.log(pc.cyan("QA Agent Doctor"));
  console.log("");

  let issues = 0;

  // Check Node version
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1).split(".")[0], 10);
  if (major >= 18) {
    console.log(pc.green(`✓ Node.js ${nodeVersion}`));
  } else {
    console.log(pc.red(`✗ Node.js ${nodeVersion} (requires >= 18)`));
    issues++;
  }

  // Check agent-browser
  const ab = isAgentBrowserAvailable();
  if (ab.ok) {
    console.log(pc.green(`✓ agent-browser ${ab.version}`));
  } else {
    console.log(pc.red(`✗ agent-browser not found`));
    console.log(pc.dim(`  ${ab.error}`));
    console.log(pc.dim("  Install: npm i -g agent-browser && agent-browser install"));
    issues++;
  }

  // Check project structure
  let root: string;
  try {
    root = findProjectRoot();
    console.log(pc.green(`✓ Project root: ${root}`));
  } catch {
    console.log(pc.yellow("⚠ Could not determine project root"));
    root = process.cwd();
  }

  const p = projectPaths(root);

  // Check qa/ directory
  if (fs.existsSync(p.qaDir)) {
    console.log(pc.green("✓ qa/ directory exists"));

    // Check config files
    const configs = [
      { path: p.usersFile, name: "users.yaml" },
      { path: p.envsFile, name: "environments.yaml" },
    ];

    for (const { path: filePath, name } of configs) {
      if (fs.existsSync(filePath)) {
        console.log(pc.green(`  ✓ qa/${name}`));
      } else {
        console.log(pc.yellow(`  ⚠ qa/${name} not found`));
      }
    }

    // Check scenarios
    if (fs.existsSync(p.scenariosDir)) {
      const scenarios = fs.readdirSync(p.scenariosDir).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));
      if (scenarios.length > 0) {
        console.log(pc.green(`  ✓ ${scenarios.length} scenario(s) in qa/scenarios/`));
      } else {
        console.log(pc.yellow("  ⚠ No scenarios found in qa/scenarios/"));
      }
    }
  } else {
    console.log(pc.yellow("⚠ qa/ directory not found"));
    console.log(pc.dim("  Run: npx qa-agent init"));
    issues++;
  }

  // Check Cursor/Claude assets
  if (fs.existsSync(p.cursorSkillsDir)) {
    const skills = fs.readdirSync(p.cursorSkillsDir).filter((d) => d.startsWith("qa-"));
    if (skills.length > 0) {
      console.log(pc.green(`✓ Cursor skills installed (${skills.length})`));
    } else {
      console.log(pc.yellow("⚠ No QA skills in .cursor/skills/"));
    }
  }

  if (fs.existsSync(p.claudeSkillsDir)) {
    const skills = fs.readdirSync(p.claudeSkillsDir).filter((d) => d.startsWith("qa-"));
    if (skills.length > 0) {
      console.log(pc.green(`✓ Claude skills installed (${skills.length})`));
    } else {
      console.log(pc.yellow("⚠ No QA skills in .claude/skills/"));
    }
  }

  console.log("");
  if (issues === 0) {
    console.log(pc.green("All checks passed!"));
  } else {
    console.log(pc.yellow(`${issues} issue(s) found.`));
    process.exitCode = 1;
  }
}
