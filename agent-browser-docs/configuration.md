# https://agent-browser.dev/configuration

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
Configuration
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


# Configuration[#](https://agent-browser.dev/configuration#configuration)
Create an `agent-browser.json` file to set persistent defaults instead of repeating flags on every command.
## Config File Locations[#](https://agent-browser.dev/configuration#config-file-locations)
agent-browser checks two locations, merged in priority order:  
| Priority  | Location  | Scope  |  
| --- | --- | --- |  
| 1 (lowest)  | `~/.agent-browser/config.json`  | User-level defaults  |  
| 2  | `./agent-browser.json`  | Project-level overrides  |  
| 3  |  `AGENT_BROWSER_*` env vars  | Override config values  |  
| 4 (highest)  | CLI flags  | Override everything  |  
Project-level values override user-level values. Environment variables override both. CLI flags always win.
Use `--config <path>` or the `AGENT_BROWSER_CONFIG` environment variable to load a specific config file instead of the default locations:

```
agent-browser --config ./ci-config.json open example.com
AGENT_BROWSER_CONFIG=./ci-config.json agent-browser open example.com
```

## Example Config[#](https://agent-browser.dev/configuration#example-config)

```
{
  "headed": true,
  "proxy": "http://localhost:8080",
  "profile": "./browser-data",
  "userAgent": "my-agent/1.0",
  "ignoreHttpsErrors": true
}
```

A [JSON Schema](https://agent-browser.dev/schema.json) is available for IDE autocomplete and validation. Add a `$schema` key to your config file to enable it:

```
{
  "$schema": "https://agent-browser.dev/schema.json",
  "headed": true
}
```

## All Options[#](https://agent-browser.dev/configuration#all-options)
Every CLI flag can be set in the config file using its camelCase equivalent:  
| Config Key  | CLI Flag  | Type  |  
| --- | --- | --- |  
| `headed`  | `--headed`  | boolean  |  
| `json`  | `--json`  | boolean  |  
| `full`  | `--full, -f`  | boolean  |  
| `debug`  | `--debug`  | boolean  |  
| `session`  | `--session`  | string  |  
| `sessionName`  | `--session-name`  | string  |  
| `executablePath`  | `--executable-path`  | string  |  
| `extensions`  | `--extension`  | string[]  |  
| `profile`  | `--profile`  | string  |  
| `state`  | `--state`  | string  |  
| `proxy`  | `--proxy`  | string  |  
| `proxyBypass`  | `--proxy-bypass`  | string  |  
| `args`  | `--args`  | string  |  
| `userAgent`  | `--user-agent`  | string  |  
| `provider`  | `-p, --provider`  | string  |  
| `device`  | `--device`  | string  |  
| `ignoreHttpsErrors`  | `--ignore-https-errors`  | boolean  |  
| `allowFileAccess`  | `--allow-file-access`  | boolean  |  
| `cdp`  | `--cdp`  | string  |  
| `autoConnect`  | `--auto-connect`  | boolean  |  
| `colorScheme`  | `--color-scheme`  | string (`dark`, `light`, `no-preference`)  |  
| `downloadPath`  | `--download-path`  | string  |  
| `contentBoundaries`  | `--content-boundaries`  | boolean  |  
| `maxOutput`  | `--max-output`  | number  |  
| `allowedDomains`  | `--allowed-domains`  | string[]  |  
| `actionPolicy`  | `--action-policy`  | string  |  
| `confirmActions`  | `--confirm-actions`  | string  |  
| `confirmInteractive`  | `--confirm-interactive`  | boolean  |  
| `engine`  | `--engine`  | string (`chrome`, `lightpanda`)  |  
| `noAutoDialog`  | `--no-auto-dialog`  | boolean  |  
| `headers`  | `--headers`  | string (JSON)  |  
## Common Configurations[#](https://agent-browser.dev/configuration#common-configurations)
### Local Development[#](https://agent-browser.dev/configuration#local-development)

```
{
  "headed": true,
  "profile": "./browser-data"
}
```

### Behind a Proxy[#](https://agent-browser.dev/configuration#behind-a-proxy)

```
{
  "proxy": "http://proxy.corp.example.com:8080",
  "proxyBypass": "localhost,*.internal.com",
  "ignoreHttpsErrors": true
}
```

### CI / Devcontainer[#](https://agent-browser.dev/configuration#ci-devcontainer)

```
{
  "args": "--no-sandbox,--disable-gpu",
  "ignoreHttpsErrors": true
}
```

### iOS Testing[#](https://agent-browser.dev/configuration#ios-testing)

```
{
  "provider": "ios",
  "device": "iPhone 16 Pro"
}
```

### AI Agent Security[#](https://agent-browser.dev/configuration#ai-agent-security)

```
{
  "contentBoundaries": true,
  "maxOutput": 50000,
  "allowedDomains": ["your-app.com", "*.your-app.com"],
  "actionPolicy": "./policy.json"
}
```

## Overriding Boolean Options[#](https://agent-browser.dev/configuration#overriding-boolean-options)
Boolean flags accept an optional `true`/`false` value to override config settings:

```
agent-browser --headed false open example.com
```

A bare flag is equivalent to passing `true`:

```
agent-browser --headed open example.com       # same as --headed true
agent-browser --headed true open example.com  # explicit
```

This applies to all boolean flags: `--headed`, `--debug`, `--json`, `--ignore-https-errors`, `--allow-file-access`, `--auto-connect`, `--content-boundaries`, `--confirm-interactive`.
## Extensions Merging[#](https://agent-browser.dev/configuration#extensions-merging)
Extensions from user-level and project-level configs are **concatenated** , not replaced. For example, if `~/.agent-browser/config.json` specifies `["/ext1"]` and `./agent-browser.json` specifies `["/ext2"]`, the result is `["/ext1", "/ext2"]`.
The `AGENT_BROWSER_EXTENSIONS` environment variable and CLI `--extension` flags follow the standard priority rules (env replaces config, CLI appends).
## Environment Variables[#](https://agent-browser.dev/configuration#environment-variables)
These environment variables configure additional daemon and runtime behavior:  
| Variable  | Description  | Default  |  
| --- | --- | --- |  
| `AGENT_BROWSER_AUTO_CONNECT`  | Auto-discover and connect to a running Chrome instance.  | (disabled)  |  
| `AGENT_BROWSER_ALLOW_FILE_ACCESS`  | Allow `file://` URLs to access local files.  | (disabled)  |  
| `AGENT_BROWSER_COLOR_SCHEME`  | Color scheme preference (`dark`, `light`, `no-preference`).  | (none)  |  
| `AGENT_BROWSER_DOWNLOAD_PATH`  | Default directory for browser downloads.  | (temp directory)  |  
| `AGENT_BROWSER_DEFAULT_TIMEOUT`  | Default timeout in ms. Keep below 30000 to avoid IPC timeouts.  | `25000`  |  
| `AGENT_BROWSER_SESSION_NAME`  | Auto-save/load state persistence name.  | (none)  |  
| `AGENT_BROWSER_STATE_EXPIRE_DAYS`  | Auto-delete saved session states older than N days.  | `30`  |  
| `AGENT_BROWSER_ENCRYPTION_KEY`  | 64-char hex key for AES-256-GCM session encryption.  | (none)  |  
| `AGENT_BROWSER_EXTENSIONS`  | Comma-separated browser extension paths. Extensions work in both headed and headless mode.  | (none)  |  
| `AGENT_BROWSER_HEADED`  | Show browser window instead of running headless (`1` to enable).  | (disabled)  |  
| `AGENT_BROWSER_STREAM_PORT`  | Override the WebSocket streaming port. By default, an OS-assigned port is used. Set this to bind to a specific port (e.g., `9223`).  | OS-assigned  |  
| `AGENT_BROWSER_IDLE_TIMEOUT_MS`  | Auto-shutdown the daemon after N ms of inactivity (no commands received). Useful for ephemeral environments.  | (disabled)  |  
| `AGENT_BROWSER_IOS_DEVICE`  | Default iOS device name for the `ios` provider.  | (none)  |  
| `AGENT_BROWSER_IOS_UDID`  | Default iOS device UDID for the `ios` provider.  | (none)  |  
| `AGENT_BROWSER_DEBUG`  | Enable debug output (`1` to enable).  | (disabled)  |  
| `AGENT_BROWSER_CONTENT_BOUNDARIES`  | Wrap page output in boundary markers for LLM safety.  | (disabled)  |  
| `AGENT_BROWSER_MAX_OUTPUT`  | Max characters for page output (truncates beyond limit).  | (unlimited)  |  
| `AGENT_BROWSER_ALLOWED_DOMAINS`  | Comma-separated allowed domain patterns (e.g., `example.com,*.example.com`).  | (unrestricted)  |  
| `AGENT_BROWSER_ACTION_POLICY`  | Path to action policy JSON file.  | (none)  |  
| `AGENT_BROWSER_CONFIRM_ACTIONS`  | Comma-separated action categories requiring confirmation.  | (none)  |  
| `AGENT_BROWSER_CONFIRM_INTERACTIVE`  | Enable interactive confirmation prompts (auto-denies if stdin is not a TTY).  | (disabled)  |  
| `AGENT_BROWSER_ENGINE`  | Browser engine to use: `chrome` (default), `lightpanda`.  | `chrome`  |  
| `AGENT_BROWSER_NO_AUTO_DIALOG`  | Disable automatic dismissal of `alert`/`beforeunload` dialogs.  | (disabled)  |  
| `AI_GATEWAY_URL`  | Vercel AI Gateway base URL.  | `https://ai-gateway.vercel.sh`  |  
| `AI_GATEWAY_API_KEY`  | API key for the Vercel AI Gateway. Required to enable AI chat.  | (none)  |  
| `AI_GATEWAY_MODEL`  | Default AI model for dashboard chat.  | `anthropic/claude-sonnet-4.6`  |  
## Error Handling[#](https://agent-browser.dev/configuration#error-handling)
  * **Auto-discovered config files** (`~/.agent-browser/config.json`, `./agent-browser.json`) that are missing are silently ignored.
  * **`--config <path>`**with a missing or malformed file exits with an error.
  * **Malformed JSON** in auto-discovered files prints a warning to stderr and continues without that file.
  * **Unknown keys** are silently ignored for forward compatibility.


> **Tip:** If your project-level `agent-browser.json` contains environment-specific values (paths, proxies), consider adding it to `.gitignore`.
Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
