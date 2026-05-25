# https://agent-browser.dev/engines/lightpanda

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
Lightpanda
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


# Lightpanda[#](https://agent-browser.dev/engines/lightpanda#lightpanda)
[Lightpanda](https://lightpanda.io/) is a headless browser engine built from scratch in Zig for machines. It starts instantly, uses 10x less memory than Chrome, and executes 10x faster.
agent-browser manages Lightpanda the same way it manages Chrome -- spawning the process, connecting via CDP, and shutting it down. All downstream commands (snapshot, click, fill, screenshot, etc.) work through the same CDP protocol path.
## Installation[#](https://agent-browser.dev/engines/lightpanda#installation)
Install the Lightpanda binary before using it with agent-browser:  
| Platform  | Command  |  
| --- | --- |  
| macOS (Apple Silicon)  | `curl -L -o lightpanda https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-aarch64-macos && chmod a+x ./lightpanda`  |  
| Linux (x86_64)  | `curl -L -o lightpanda https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-x86_64-linux && chmod a+x ./lightpanda`  |  
Move the binary somewhere in your `PATH` (e.g. `/usr/local/bin/lightpanda` or `~/.local/bin/lightpanda`).
See the [Lightpanda installation docs](https://lightpanda.io/docs/open-source/installation) for more options.
## Usage[#](https://agent-browser.dev/engines/lightpanda#usage)
Use the `--engine` flag to select Lightpanda:

```
agent-browser --engine lightpanda open example.com
agent-browser --engine lightpanda snapshot
agent-browser --engine lightpanda screenshot
```

Or set it as the default via environment variable:

```
export AGENT_BROWSER_ENGINE=lightpanda
agent-browser open example.com
```

Or in your `agent-browser.json` config:

```
{
  "engine": "lightpanda"
}
```

## Custom Binary Path[#](https://agent-browser.dev/engines/lightpanda#custom-binary-path)
If the `lightpanda` binary is not in your `PATH`, use `--executable-path`:

```
agent-browser --engine lightpanda --executable-path /path/to/lightpanda open example.com
```

## Differences from Chrome[#](https://agent-browser.dev/engines/lightpanda#differences-from-chrome)
Lightpanda is a purpose-built headless engine. Some Chrome-specific features are not available:  
| Feature  | Status  |  
| --- | --- |  
| Extensions (`--extension`)  | Not supported  |  
| Persistent profiles (`--profile`)  | Not supported  |  
| Storage state (`--state`)  | Not supported  |  
| File access (`--allow-file-access`)  | Not supported  |  
| Headed mode (`--headed`)  | Not applicable (headless only)  |  
| Screenshots  | Depends on Lightpanda CDP support  |  
agent-browser returns a clear error if you combine `--engine lightpanda` with unsupported flags.
## When to Use Lightpanda[#](https://agent-browser.dev/engines/lightpanda#when-to-use-lightpanda)
Lightpanda is a good fit for:
  * Fast web scraping and data extraction
  * AI agent workflows where speed and low memory matter
  * CI/CD environments with constrained resources
  * High-volume parallel automation


Use Chrome when you need full browser fidelity, extensions, or persistent profiles.
Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
