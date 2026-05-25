import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { Sink } from "./index";
import { RunResult } from "../types";

export interface S3SinkConfig {
  type: "s3";
  bucket: string;
  prefix?: string;
  region?: string;
  credentials_env?: string;
}

export class S3Sink implements Sink {
  name = "s3";
  private config: S3SinkConfig;

  constructor(config: S3SinkConfig) {
    this.config = config;
  }

  async send(run: RunResult): Promise<void> {
    const prefix = this.config.prefix ?? "";
    const s3Path = `s3://${this.config.bucket}/${prefix}${run.run_id}/`;

    const env: Record<string, string> = { ...process.env } as Record<string, string>;
    if (this.config.region) {
      env.AWS_REGION = this.config.region;
    }
    if (this.config.credentials_env) {
      env.AWS_PROFILE = process.env[this.config.credentials_env] || this.config.credentials_env;
    }

    // Use AWS CLI to sync
    const cmd = `aws s3 sync "${run.artifacts.dir}" "${s3Path}" --quiet`;
    try {
      execSync(cmd, { env, stdio: "pipe" });
    } catch (err) {
      throw new Error(`S3 upload failed: ${(err as Error).message}`);
    }
  }
}
