# https://agent-browser.dev/providers/browserless

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
Browserless
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


# Browserless[#](https://agent-browser.dev/providers/browserless#browserless)
[Browserless](https://browserless.io) provides cloud browser infrastructure with a Sessions API. Use it when running agent-browser in environments where a local browser isn't available.
## Setup[#](https://agent-browser.dev/providers/browserless#setup)

```
export BROWSERLESS_API_KEY="your-api-token"
agent-browser -p browserless open https://example.com
```

Or use environment variables for CI/scripts:

```
export AGENT_BROWSER_PROVIDER=browserless
export BROWSERLESS_API_KEY="your-api-token"
agent-browser open https://example.com
```

The `-p` flag takes precedence over `AGENT_BROWSER_PROVIDER`.
## Configuration[#](https://agent-browser.dev/providers/browserless#configuration)  
| Variable  | Description  | Default  |  
| --- | --- | --- |  
| `BROWSERLESS_API_KEY`  | API token (required)  |   |  
| `BROWSERLESS_API_URL`  | Base API URL (for custom regions or self-hosted)  | `https://production-sfo.browserless.io`  |  
| `BROWSERLESS_BROWSER_TYPE`  | Type of browser to use (`chromium` or `chrome`)  | `chromium`  |  
| `BROWSERLESS_TTL`  | Session TTL in milliseconds  | `300000`  |  
| `BROWSERLESS_STEALTH`  | Enable stealth mode  | `true`  |  
When enabled, agent-browser connects to a Browserless cloud session instead of launching a local browser. All commands work identically.
Get your API token from the [Browserless Dashboard](https://browserless.io).
Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
