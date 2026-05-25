# https://agent-browser.dev/

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
Introduction
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


# agent-browser[#](https://agent-browser.dev/#agent-browser)
Browser automation CLI designed for AI agents. Compact text output minimizes context usage. 100% native Rust.

```
npm install -g agent-browser      # all platforms
brew install agent-browser        # macOS
agent-browser install             # Download Chrome (first time)

# or try without installing
npx agent-browser open example.com
```

## Features[#](https://agent-browser.dev/#features)
  * **Agent-first** - Compact text output uses fewer tokens than JSON, designed for AI context efficiency
  * **Ref-based** - Snapshot returns accessibility tree with refs for deterministic element selection
  * **Fast** - Native Rust CLI for instant command parsing
  * **Complete** - 50+ commands for navigation, forms, screenshots, network, storage
  * **Sessions** - Multiple isolated browser instances with separate auth
  * **Cross-platform** - macOS, Linux, Windows with native binaries


## Works with[#](https://agent-browser.dev/#works-with)
Claude Code, Cursor, GitHub Copilot, OpenAI Codex, Google Gemini, opencode, and any agent that can run shell commands.
## Example[#](https://agent-browser.dev/#example)

```
# Navigate and get snapshot
agent-browser open example.com
agent-browser snapshot -i

# Output:
# - heading "Example Domain" [ref=e1]
# - link "More information..." [ref=e2]

# Interact using refs
agent-browser click @e2
agent-browser screenshot page.png
agent-browser close
```

## Why refs?[#](https://agent-browser.dev/#why-refs)
The `snapshot` command returns a compact accessibility tree where each element has a unique ref like `@e1`, `@e2`. This provides:
  * **Context-efficient** - Text output uses ~200-400 tokens vs ~3000-5000 for full DOM
  * **Deterministic** - Ref points to exact element from snapshot
  * **Fast** - No DOM re-query needed
  * **AI-friendly** - LLMs parse text output naturally


## Architecture[#](https://agent-browser.dev/#architecture)
Client-daemon architecture for optimal performance:
  1. **Rust CLI** - Parses commands, communicates with daemon
  2. **Native Daemon** - Pure Rust daemon using direct CDP, manages Chrome via Chrome DevTools Protocol


Daemon starts automatically and persists between commands.
## Platforms[#](https://agent-browser.dev/#platforms)
Native Rust binaries for macOS (ARM64, x64), Linux (ARM64, x64), and Windows (x64).
Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
