import { Sink } from "./index";
import { RunResult } from "../types";

export interface SlackSinkConfig {
  type: "slack";
  channel: string;
}

export class SlackSink implements Sink {
  name = "slack";
  private config: SlackSinkConfig;

  constructor(config: SlackSinkConfig) {
    this.config = config;
  }

  async send(run: RunResult): Promise<void> {
    // Build message
    const statusEmoji = run.status === "pass" ? ":white_check_mark:" : run.status === "fail" ? ":x:" : ":warning:";
    const statusText = run.status.toUpperCase();

    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${statusEmoji} QA Run: ${run.scenario}`,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Status:* ${statusText}` },
          { type: "mrkdwn", text: `*Duration:* ${(run.duration_ms / 1000).toFixed(2)}s` },
          { type: "mrkdwn", text: `*Environment:* ${run.env}` },
          { type: "mrkdwn", text: `*User:* ${run.user}` },
        ],
      },
    ];

    if (run.status === "fail" && run.fail_message) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Failure at step ${run.fail_step}:* ${run.fail_message}`,
        },
      } as any);
    }

    const message = {
      channel: this.config.channel,
      blocks,
      text: `QA ${statusText}: ${run.scenario} (${run.env})`,
    };

    // This would use the Slack MCP if available
    // For now, we'll try to use a webhook if SLACK_WEBHOOK_URL is set
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (webhookUrl) {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
      if (!response.ok) {
        throw new Error(`Slack webhook failed: ${response.status}`);
      }
    } else {
      // Log that we would send to Slack
      console.log(`[Slack] Would notify ${this.config.channel}: ${run.scenario} ${statusText}`);
    }
  }
}
