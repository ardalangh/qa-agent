# https://agent-browser.dev/dashboard

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
Dashboard
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


# Observability Dashboard[#](https://agent-browser.dev/dashboard#observability-dashboard)
Monitor agent-browser sessions in real time with a local web dashboard showing a live browser viewport and command activity feed.
## Usage[#](https://agent-browser.dev/dashboard#usage)
The dashboard is bundled into the binary and requires no separate install. Start the server and open any session:

```
agent-browser dashboard start
agent-browser open example.com
```

Then open `http://localhost:4848` or a proxied/forwarded dashboard URL such as `https://dashboard.agent-browser.localhost` in your browser to see the live dashboard.
All sessions automatically stream to the dashboard. No extra flags are needed. The browser stays on the dashboard origin while the server proxies per-session tabs, status, and stream traffic internally, so session ports do not need to be exposed.
### Custom stream port[#](https://agent-browser.dev/dashboard#custom-stream-port)
By default each session binds its WebSocket stream server to an OS-assigned port. To use a specific port, set the `AGENT_BROWSER_STREAM_PORT` environment variable:

```
AGENT_BROWSER_STREAM_PORT=9223 agent-browser open example.com
```

You can also use the runtime commands to control streaming on a running session:

```
agent-browser stream enable --port 9223
agent-browser stream status
agent-browser stream disable
```

## Dashboard features[#](https://agent-browser.dev/dashboard#dashboard-features)
The dashboard is a single-page web app with three areas:  
| Area  | Description  |  
| --- | --- |  
| **Live viewport**  | Real-time JPEG frames from the browser, rendered to a canvas element  |  
| **Activity feed**  | Chronological stream of commands, results, and console messages with expandable details  |  
| **Session creation**  | Create new sessions from the dashboard with local engines (Chrome, Lightpanda) or cloud providers (AgentCore, Browserbase, Browserless, Browser Use, Kernel)  |  
| **Status bar**  | Connection status, viewport dimensions, and WebSocket endpoint  |  
## WebSocket protocol[#](https://agent-browser.dev/dashboard#websocket-protocol)
The dashboard connects to the same WebSocket endpoint used by [Streaming](https://agent-browser.dev/streaming), with additional message types for observability:
### Command events[#](https://agent-browser.dev/dashboard#command-events)
Sent when a command begins executing:

```
{
  "type": "command",
  "action": "click",
  "id": "r123",
  "params": { "selector": "@e5" },
  "timestamp": 1711367000000
}
```

### Result events[#](https://agent-browser.dev/dashboard#result-events)
Sent when a command finishes:

```
{
  "type": "result",
  "id": "r123",
  "action": "click",
  "success": true,
  "data": {},
  "duration_ms": 45,
  "timestamp": 1711367000045
}
```

### Console events[#](https://agent-browser.dev/dashboard#console-events)
Sent when the browser logs to the console:

```
{
  "type": "console",
  "level": "log",
  "text": "Page loaded",
  "args": [{"type": "string", "value": "Page loaded"}],
  "timestamp": 1711367000100
}
```

The `args` array contains the raw CDP `Runtime.consoleAPICalled` arguments for programmatic access. Object arguments include preview data (e.g. `{userId: "abc", count: 42}` instead of `"Object"`).
These are in addition to the existing `frame`, `status`, and `error` message types documented on the [Streaming](https://agent-browser.dev/streaming) page.
## Architecture[#](https://agent-browser.dev/dashboard#architecture)
The dashboard is a Next.js static export (`output: 'export'`) that produces plain HTML, CSS, and JS. It lives at `packages/dashboard/` in the monorepo and is built with:

```
pnpm build:dashboard
```

The dashboard is embedded into the CLI binary at compile time using `rust-embed`. Plain HTTP requests serve the embedded dashboard assets and same-origin API routes. Session-specific tabs, status, and stream WebSocket traffic are proxied through the dashboard server to loopback-only session ports.
## AI Chat[#](https://agent-browser.dev/dashboard#ai-chat)
The dashboard includes an optional AI chat panel powered by the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway). When enabled, a **Chat** tab appears in the right pane alongside Activity, Console, Network, Storage, and Extensions.
### Setup[#](https://agent-browser.dev/dashboard#setup)
The Chat tab is always visible. Set the API key to enable responses:

```
export AI_GATEWAY_API_KEY=gw_your_key_here
agent-browser dashboard start
```

Optionally override the gateway URL or model:

```
export AI_GATEWAY_URL=https://ai-gateway.vercel.sh   # this is the default
export AI_GATEWAY_MODEL=openai/gpt-4o-mini           # default: anthropic/claude-sonnet-4.6
```

### How it works[#](https://agent-browser.dev/dashboard#how-it-works)
The Rust server proxies chat requests from the dashboard to the Vercel AI Gateway and streams responses back using the Vercel AI SDK's UI Message Stream protocol. The dashboard frontend uses `useChat` from `@ai-sdk/react` with `DefaultChatTransport`.  
| Variable  | Description  | Default  |  
| --- | --- | --- |  
| `AI_GATEWAY_URL`  | Vercel AI Gateway base URL.  | `https://ai-gateway.vercel.sh`  |  
| `AI_GATEWAY_API_KEY`  | API key for the AI Gateway. Required to enable AI chat responses.  | (none)  |  
| `AI_GATEWAY_MODEL`  | Default AI model for chat requests.  | `anthropic/claude-sonnet-4.6`  |  
Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
