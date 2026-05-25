# https://agent-browser.dev/next

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
Next.js + Vercel
  * [Introduction](https://agent-browser.dev/)
  * [Installation](https://agent-browser.dev/installation)
  * [Quick Start](https://agent-browser.dev/quick-start)
  * [Skills](https://agent-browser.dev/skills)


#### Reference
  * [Commands](https://agent-browser.dev/commands)
  * [Configuration](https://agent-browser.dev/configuration)
  * [Selectors](https://agent-browser.dev/selectors)
  * [Snapshots](https://agent-browser.dev/snapshots)


#### Features
  * [Sessions](https://agent-browser.dev/sessions)
  * [Dashboard](https://agent-browser.dev/dashboard)
  * [Diffing](https://agent-browser.dev/diffing)
  * [CDP Mode](https://agent-browser.dev/cdp-mode)
  * [Streaming](https://agent-browser.dev/streaming)
  * [Profiler](https://agent-browser.dev/profiler)
  * [iOS Simulator](https://agent-browser.dev/ios)
  * [Security](https://agent-browser.dev/security)
  * [Next.js + Vercel](https://agent-browser.dev/next)
  * [Native Mode](https://agent-browser.dev/native-mode)


#### Providers
  * [AgentCore](https://agent-browser.dev/providers/agentcore)
  * [Browser Use](https://agent-browser.dev/providers/browser-use)
  * [Browserbase](https://agent-browser.dev/providers/browserbase)
  * [Browserless](https://agent-browser.dev/providers/browserless)
  * [Kernel](https://agent-browser.dev/providers/kernel)


#### Engines
  * [Chrome](https://agent-browser.dev/engines/chrome)
  * [Lightpanda](https://agent-browser.dev/engines/lightpanda)


  * [Changelog](https://agent-browser.dev/changelog)


# Next.js + Vercel[#](https://agent-browser.dev/next#nextjs-vercel)
Run agent-browser from a Next.js app on Vercel using Vercel Sandbox. A Linux microVM spins up on demand, runs agent-browser + Chrome, and shuts down. No binary size limits, no Chromium bundling complexity.
## Setup[#](https://agent-browser.dev/next#setup)

```
pnpm add @vercel/sandbox
```

## Server action[#](https://agent-browser.dev/next#server-action)
The Vercel Sandbox runs Amazon Linux. Chromium requires system libraries that are not installed by default, so fresh sandboxes need a `dnf install` step before agent-browser can launch Chrome. Use a sandbox snapshot (below) to skip this entirely in production.

```
"use server";
import { Sandbox } from "@vercel/sandbox";

const snapshotId = process.env.AGENT_BROWSER_SNAPSHOT_ID;

const CHROMIUM_SYSTEM_DEPS = [
  "nss", "nspr", "libxkbcommon", "atk", "at-spi2-atk", "at-spi2-core",
  "libXcomposite", "libXdamage", "libXrandr", "libXfixes", "libXcursor",
  "libXi", "libXtst", "libXScrnSaver", "libXext", "mesa-libgbm", "libdrm",
  "mesa-libGL", "mesa-libEGL", "cups-libs", "alsa-lib", "pango", "cairo",
  "gtk3", "dbus-libs",
];

function getSandboxCredentials() {
  if (
    process.env.VERCEL_TOKEN &&
    process.env.VERCEL_TEAM_ID &&
    process.env.VERCEL_PROJECT_ID
  ) {
    return {
      token: process.env.VERCEL_TOKEN,
      teamId: process.env.VERCEL_TEAM_ID,
      projectId: process.env.VERCEL_PROJECT_ID,
    };
  }
  return {};
}

async function withBrowser​​T​​(
  fn: (sandbox: InstanceType<typeof Sandbox>) => Promise​​T​​,
): Promise​​T​​ {
  const credentials = getSandboxCredentials();

  const sandbox = snapshotId
    ? await Sandbox.create({
        ...credentials,
        source: { type: "snapshot", snapshotId },
        timeout: 120_000,
      })
    : await Sandbox.create({ ...credentials, runtime: "node24", timeout: 120_000 });

  if (!snapshotId) {
    await sandbox.runCommand("sh", [
      "-c",
      `sudo dnf clean all 2>&1 && sudo dnf install -y --skip-broken ${CHROMIUM_SYSTEM_DEPS.join(" ")} 2>&1 && sudo ldconfig 2>&1`,
    ]);
    await sandbox.runCommand("npm", ["install", "-g", "agent-browser"]);
    await sandbox.runCommand("npx", ["agent-browser", "install"]);
  }

  try {
    return await fn(sandbox);
  } finally {
    await sandbox.stop();
  }
}

export async function screenshotUrl(url: string) {
  return withBrowser(async (sandbox) => {
    await sandbox.runCommand("agent-browser", ["open", url]);

    const ssResult = await sandbox.runCommand("agent-browser", [
      "screenshot", "--json",
    ]);
    const ssPath = JSON.parse(await ssResult.stdout())?.data?.path;
    const b64Result = await sandbox.runCommand("base64", ["-w", "0", ssPath]);
    const screenshot = (await b64Result.stdout()).trim();

    await sandbox.runCommand("agent-browser", ["close"]);
    return { ok: true, screenshot };
  });
}

export async function snapshotUrl(url: string) {
  return withBrowser(async (sandbox) => {
    await sandbox.runCommand("agent-browser", ["open", url]);

    const result = await sandbox.runCommand("agent-browser", [
      "snapshot", "-i", "-c",
    ]);
    const snapshot = await result.stdout();

    await sandbox.runCommand("agent-browser", ["close"]);
    return { ok: true, snapshot };
  });
}
```

## Sandbox snapshots[#](https://agent-browser.dev/next#sandbox-snapshots)
Without optimization, each Sandbox run installs system dependencies + agent-browser + Chromium from scratch (~30 seconds). A **sandbox snapshot** is a saved VM image with everything pre-installed -- like a Docker image for Vercel Sandbox. When `AGENT_BROWSER_SNAPSHOT_ID` is set, the sandbox boots from that image instead of installing, bringing startup down to sub-second.
This is different from an agent-browser _accessibility snapshot_ (which dumps a page's accessibility tree). A sandbox snapshot is a Vercel infrastructure concept.
Create a sandbox snapshot by running the helper script once:

```
npx tsx scripts/create-snapshot.ts
```

The script spins up a fresh sandbox, installs system dependencies + agent-browser + Chromium, saves the VM state, and prints the snapshot ID:

```
AGENT_BROWSER_SNAPSHOT_ID=snap_xxxxxxxxxxxx
```

Add this to your Vercel project environment variables (or `.env.local` for local development). Recommended for any production deployment.
## Authentication[#](https://agent-browser.dev/next#authentication)
On Vercel deployments, the Sandbox SDK authenticates automatically via OIDC. For local development, provide explicit credentials:  
| Variable  | Description  |  
| --- | --- |  
| `VERCEL_TOKEN`  | Vercel personal access token  |  
| `VERCEL_TEAM_ID`  | Vercel team ID  |  
| `VERCEL_PROJECT_ID`  | Vercel project ID  |  
When all three are set, they are passed to `Sandbox.create()`. When absent, the SDK falls back to `VERCEL_OIDC_TOKEN` (automatic on Vercel).
## Scheduled workflows (cron)[#](https://agent-browser.dev/next#scheduled-workflows-cron)
For recurring tasks like daily monitoring, use Vercel Cron Jobs:

```
// app/api/cron/monitor/route.ts
export async function GET() {
  const result = await withBrowser(async (sandbox) => {
    await sandbox.runCommand("agent-browser", [
      "open", "https://example.com/pricing",
    ]);
    const snap = await sandbox.runCommand("agent-browser", [
      "snapshot", "-i", "-c",
    ]);
    await sandbox.runCommand("agent-browser", ["close"]);
    return await snap.stdout();
  });

  // Process results, send alerts, store data...
  return Response.json({ ok: true, snapshot: result });
}
```


```
// vercel.json
{
  "crons": [
    { "path": "/api/cron/monitor", "schedule": "0 9 * * *" }
  ]
}
```

## Environment variables[#](https://agent-browser.dev/next#environment-variables)  
| Variable  | Description  |  
| --- | --- |  
| `AGENT_BROWSER_SNAPSHOT_ID`  | Sandbox snapshot ID for sub-second startup (see above)  |  
| `VERCEL_TOKEN`  | Vercel personal access token (for local dev; OIDC is automatic on Vercel)  |  
| `VERCEL_TEAM_ID`  | Vercel team ID (for local dev)  |  
| `VERCEL_PROJECT_ID`  | Vercel project ID (for local dev)  |  
## Demo app[#](https://agent-browser.dev/next#demo-app)
A working demo with streaming progress UI, rate limiting, and a deploy-to-Vercel button is at [`examples/environments/`](https://github.com/vercel-labs/agent-browser/tree/main/examples/environments).
Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
