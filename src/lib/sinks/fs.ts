import fs from "node:fs";
import path from "node:path";
import { Sink } from "./index";
import { RunResult } from "../types";

export interface FsSinkConfig {
  type: "fs";
  path: string;
  mode?: "copy" | "symlink";
}

export class FsSink implements Sink {
  name = "fs";
  private config: FsSinkConfig;

  constructor(config: FsSinkConfig) {
    this.config = config;
  }

  async send(run: RunResult): Promise<void> {
    const destDir = path.join(this.config.path, run.run_id);
    fs.mkdirSync(destDir, { recursive: true });

    if (this.config.mode === "symlink") {
      fs.symlinkSync(run.artifacts.dir, destDir, "dir");
    } else {
      copyDirRecursive(run.artifacts.dir, destDir);
    }
  }
}

function copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
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
