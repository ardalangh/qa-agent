# https://agent-browser.dev/cdp-mode

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
CDP Mode
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


# CDP Mode[#](https://agent-browser.dev/cdp-mode#cdp-mode)
Connect to an existing browser via Chrome DevTools Protocol:

```
# Start Chrome with: google-chrome --remote-debugging-port=9222

# Connect once, then run commands without --cdp
agent-browser connect 9222
agent-browser snapshot
agent-browser tab
agent-browser close

# Or pass --cdp on each command
agent-browser --cdp 9222 snapshot
```

## Remote WebSocket URLs[#](https://agent-browser.dev/cdp-mode#remote-websocket-urls)
Connect to remote browser services via WebSocket URL:

```
# Connect to remote browser service
agent-browser --cdp "wss://browser-service.com/cdp?token=..." snapshot

# Works with any CDP-compatible service
agent-browser --cdp "ws://localhost:9222/devtools/browser/abc123" open example.com
```

The `--cdp` flag accepts either:
  * A port number (e.g., `9222`) for local connections via `http://localhost:{port}`
  * A full WebSocket URL (e.g., `wss://...` or `ws://...`) for remote browser services


## Auto-Connect[#](https://agent-browser.dev/cdp-mode#auto-connect)
Use `--auto-connect` to automatically discover and connect to a running Chrome instance without specifying a port:

```
# Auto-discover running Chrome with remote debugging
agent-browser --auto-connect open example.com
agent-browser --auto-connect snapshot

# Or via environment variable
AGENT_BROWSER_AUTO_CONNECT=1 agent-browser snapshot
```

Auto-connect discovers Chrome by:
  1. Reading Chrome's `DevToolsActivePort` file from the default user data directory
  2. Falling back to probing common debugging ports (9222, 9229)
  3. If HTTP-based discovery (`/json/version`, `/json/list`) fails, falling back to a direct WebSocket connection


This is useful when:
  * Chrome 144+ has remote debugging enabled via `chrome://inspect/#remote-debugging` (which uses a dynamic port)
  * You want a zero-configuration connection to your existing browser
  * You don't want to track which port Chrome is using


## Color scheme[#](https://agent-browser.dev/cdp-mode#color-scheme)
Use `--color-scheme` to set a persistent preference when connecting via CDP:

```
agent-browser --cdp 9222 --color-scheme dark open https://example.com
agent-browser --cdp 9222 snapshot  # stays in dark mode
```

Or set it globally via config or environment variable:

```
AGENT_BROWSER_COLOR_SCHEME=dark agent-browser --cdp 9222 open https://example.com
```

## Use cases[#](https://agent-browser.dev/cdp-mode#use-cases)
This enables control of:
  * Electron apps
  * Chrome/Chromium with remote debugging
  * WebView2 applications
  * Remote browser services (via WebSocket URL)
  * Any browser exposing a CDP endpoint


## Global options[#](https://agent-browser.dev/cdp-mode#global-options)  
| Option  | Description  |  
| --- | --- |  
| `--session <name>`  | Use isolated session  |  
| `--profile <path>`  | Persistent browser profile directory  |  
| `-p <provider>`  | Cloud browser provider (`browserbase`, `browseruse`, `kernel`, `browserless`)  |  
| `--headers <json>`  | HTTP headers scoped to origin  |  
| `--executable-path`  | Custom browser executable  |  
| `--args <args>`  | Browser launch args (comma-separated)  |  
| `--user-agent <ua>`  | Custom User-Agent string  |  
| `--proxy <url>`  | Proxy server URL  |  
| `--proxy-bypass <hosts>`  | Hosts to bypass proxy  |  
| `--json`  | JSON output for scripts  |  
| `--name, -n`  | Locator name filter  |  
| `--exact`  | Exact text match  |  
| `--headed`  | Show browser window  |  
| `--cdp <port|url>`  | CDP connection (port or WebSocket URL)  |  
| `--auto-connect`  | Auto-discover and connect to running Chrome  |  
| `--color-scheme <scheme>`  | Persistent color scheme (`dark`, `light`, `no-preference`)  |  
| `--debug`  | Debug output  |  
## Cloud providers[#](https://agent-browser.dev/cdp-mode#cloud-providers)
Use the `-p` flag to connect to a cloud browser provider instead of launching a local browser:

```
agent-browser -p browserbase open https://example.com
```

See the [Providers](https://agent-browser.dev/providers/browser-use) section for setup and configuration of each supported provider: [Browser Use](https://agent-browser.dev/providers/browser-use), [Browserbase](https://agent-browser.dev/providers/browserbase), [Browserless](https://agent-browser.dev/providers/browserless), and [Kernel](https://agent-browser.dev/providers/kernel).
Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
