import { Sink } from "./index";
import { RunResult } from "../types";

export interface LinearSinkConfig {
  type: "linear";
  team: string;
  labels?: string[];
}

export class LinearSink implements Sink {
  name = "linear";
  private config: LinearSinkConfig;

  constructor(config: LinearSinkConfig) {
    this.config = config;
  }

  async send(run: RunResult): Promise<void> {
    // Build issue content
    const title = `[QA ${run.status.toUpperCase()}] ${run.scenario} on ${run.env}`;

    let description = `## QA Run Failed\n\n`;
    description += `- **Scenario:** ${run.scenario}\n`;
    description += `- **Environment:** ${run.env}\n`;
    description += `- **User:** ${run.user}\n`;
    description += `- **Duration:** ${(run.duration_ms / 1000).toFixed(2)}s\n`;
    description += `- **Run ID:** \`${run.run_id}\`\n`;

    if (run.fail_step !== undefined) {
      description += `\n### Failure Details\n\n`;
      description += `- **Failed at step:** ${run.fail_step}\n`;
      if (run.fail_message) {
        description += `- **Error:** ${run.fail_message}\n`;
      }
    }

    if (run.artifacts.report) {
      description += `\n### Artifacts\n\n`;
      description += `- Report: \`${run.artifacts.report}\`\n`;
      if (run.artifacts.video) {
        description += `- Video: \`${run.artifacts.video}\`\n`;
      }
    }

    // This would use the Linear MCP if available
    // For now, we'll use the Linear API if LINEAR_API_KEY is set
    const apiKey = process.env.LINEAR_API_KEY;
    if (apiKey) {
      const query = `
        mutation CreateIssue($title: String!, $description: String!, $teamId: String!) {
          issueCreate(input: { title: $title, description: $description, teamId: $teamId }) {
            success
            issue {
              id
              identifier
            }
          }
        }
      `;

      const response = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        body: JSON.stringify({
          query,
          variables: {
            title,
            description,
            teamId: this.config.team,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Linear API failed: ${response.status}`);
      }

      const result = await response.json() as {
        data?: { issueCreate?: { success: boolean; issue?: { identifier: string } } };
      };
      if (result.data?.issueCreate?.success) {
        console.log(`[Linear] Created issue: ${result.data.issueCreate.issue?.identifier}`);
      }
    } else {
      // Log that we would create a Linear issue
      console.log(`[Linear] Would create issue in team ${this.config.team}: ${title}`);
    }
  }
}
