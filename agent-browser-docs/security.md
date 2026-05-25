# https://agent-browser.dev/security

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
Security
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


# Security[#](https://agent-browser.dev/security#security)
agent-browser includes security features to protect against credential exposure, prompt injection via untrusted page content, and unauthorized browser actions.
All security features are opt-in. By default, agent-browser imposes no restrictions on navigation, actions, or output. Enable these features as needed for your deployment -- existing workflows are unaffected until you explicitly activate a feature.
## Threat Model[#](https://agent-browser.dev/security#threat-model)
These features are designed to mitigate the following threats when an LLM-based agent drives a browser:
  * **Credential exposure** -- Passwords stored in the auth vault are never included in LLM context. The CLI handles vault operations locally; credentials do not pass through the daemon's IPC channel.
  * **Prompt injection via page content** -- Malicious pages can embed text that looks like tool output or system instructions. Content boundary markers (`--content-boundaries`) let the orchestrator distinguish trusted tool output from untrusted page content.
  * **Unauthorized navigation / data exfiltration** -- A compromised or manipulated agent could navigate to attacker-controlled domains to exfiltrate data. The domain allowlist (`--allowed-domains`) blocks navigations, sub-resource requests, WebSocket connections, EventSource streams, and `sendBeacon` calls to non-allowed domains.
  * **Unauthorized destructive actions** -- Action policy (`--action-policy`) and confirmation gating (`--confirm-actions`) prevent the agent from performing dangerous operations (eval, downloads, uploads) without explicit approval.
  * **Context flooding** -- Large page outputs can overwhelm an LLM's context window. Output truncation (`--max-output`) caps the size of page-sourced content.


### Known limitations[#](https://agent-browser.dev/security#known-limitations)
  * **WebSocket/EventSource blocking is best-effort.** It works by overriding browser constructors via an init script. If the `eval` action category is allowed, page scripts could theoretically restore the original constructors. Deny `eval` via `--action-policy` for maximum protection.
  * **Domain filter timing on remote connections.** When connecting to a pre-existing browser via CDP or a cloud provider, pages may have already loaded content before the domain filter is installed. agent-browser navigates disallowed pages to `about:blank` after the filter is active, but resources loaded before that point are not retroactively blocked.
  * **Content boundaries are defense-in-depth.** They rely on the LLM and orchestrator respecting the structural markers. A sufficiently capable adversarial page could attempt to mimic the boundary format, though the per-process CSPRNG nonce makes this impractical to predict.
  * **Confirmation timeout.** Pending confirmations auto-deny after 60 seconds. Orchestrators must respond within that window.
  * **Non-TTY auto-deny.** When `--confirm-interactive` is set but stdin is not a terminal (e.g., piped input), actions are automatically denied to prevent accidental approval in non-interactive contexts.


## Authentication Vault[#](https://agent-browser.dev/security#authentication-vault)
Store credentials locally and reference them by name. The LLM never sees passwords.

```
# Save credentials (encrypted if AGENT_BROWSER_ENCRYPTION_KEY is set)
# Recommended: pipe password via stdin to avoid shell history / process listing exposure
echo "pass" | agent-browser auth save github --url https://github.com/login --username user --password-stdin

# Or pass directly (a warning will be shown)
agent-browser auth save github --url https://github.com/login --username user --password pass

# Login using saved credentials
agent-browser auth login github

# List saved profiles (names and URLs only, no secrets)
agent-browser auth list

# Show profile metadata
agent-browser auth show github

# Delete a profile
agent-browser auth delete github
```

`auth login` navigates with the `load` lifecycle event and then waits for form selectors to appear before filling/clicking. This makes delayed SPA login pages more reliable while avoiding `networkidle` hangs on pages with long-lived background requests.
Custom selectors can be specified if auto-detection fails:

```
agent-browser auth save myapp \
  --url https://app.example.com/login \
  --username user --password pass \
  --username-selector "#email" \
  --password-selector "#password" \
  --submit-selector "button.login"
```

Profiles are stored in `~/.agent-browser/auth/` and always encrypted with AES-256-GCM. If `AGENT_BROWSER_ENCRYPTION_KEY` is not set, a key is auto-generated at `~/.agent-browser/.encryption-key` on first use. Back up this file or set the environment variable explicitly for portability.
File permissions are enforced on both Unix (`chmod 600`/`700`) and Windows (`icacls` restricted to the current user) to prevent other users from reading encryption keys or auth profiles.
## Content Boundary Markers[#](https://agent-browser.dev/security#content-boundary-markers)
When `--content-boundaries` is enabled, all page-sourced output is wrapped in structural markers so LLMs can distinguish tool output from untrusted page content:

```
--- AGENT_BROWSER_PAGE_CONTENT nonce=a1b2c3d4 origin=https://example.com ---
[snapshot / text / html / eval output here]
--- END_AGENT_BROWSER_PAGE_CONTENT nonce=a1b2c3d4 ---
```

The nonce is a random value generated per CLI process invocation, making it unpredictable to page content that might attempt to spoof the boundary.
Enable via flag or environment variable:

```
agent-browser --content-boundaries snapshot
# or
export AGENT_BROWSER_CONTENT_BOUNDARIES=1
```

Affected output types: `snapshot`, `get text`, `get html`, `eval`, `console`.
In `--json` mode, boundary metadata is injected into the JSON response as a `_boundary` object containing `nonce` and `origin` fields, allowing orchestrators to verify provenance programmatically:

```
{
  "success": true,
  "data": { "snapshot": "...", "origin": "https://example.com" },
  "_boundary": { "nonce": "a1b2c3d4e5f6...", "origin": "https://example.com" }
}
```

## Domain Allowlist[#](https://agent-browser.dev/security#domain-allowlist)
Restrict which domains the browser can interact with, preventing redirect-based attacks and data exfiltration:

```
agent-browser --allowed-domains "example.com,*.example.com,github.com" open https://example.com
# or
export AGENT_BROWSER_ALLOWED_DOMAINS="example.com,*.example.com"
```

Supports exact match (`github.com`) and wildcard prefix (`*.example.com`, which also matches the bare domain `example.com`). Both page navigations and sub-resource requests (scripts, images, fetch, XHR, etc.) to non-allowed domains are blocked, preventing data exfiltration. WebSocket and EventSource connections are also blocked via constructor-level patching. Non-http(s) sub-resources (data URIs, blobs) are still allowed. When a request is blocked, the command returns an error.
> **Note:** The WebSocket/EventSource blocking is best-effort -- it works by overriding the browser constructors via an init script. If the `eval` action category is allowed, page scripts could theoretically restore the original constructors. For maximum protection, deny the `eval` category via `--action-policy` when using `--allowed-domains`.
Config file:

```
{
  "allowedDomains": ["example.com", "*.example.com", "github.com"]
}
```

> **CDN and third-party resources:** The domain filter blocks all sub-resource requests (scripts, stylesheets, images, fonts, fetch/XHR) to non-allowed domains. Most websites load assets from CDN domains. Include these in your allowlist or pages will break. For example:
> 
```
--allowed-domains "myapp.com,*.myapp.com,cdn.jsdelivr.net,fonts.googleapis.com,fonts.gstatic.com"
```

## Action Policy[#](https://agent-browser.dev/security#action-policy)
Gate actions using a static policy file. The policy is enforced by the daemon -- denied actions fail immediately.

```
agent-browser --action-policy ./policy.json open https://example.com
# or
export AGENT_BROWSER_ACTION_POLICY=./policy.json
```

Example policy (permissive with specific denials):

```
{
  "default": "allow",
  "deny": ["eval", "download", "upload"]
}
```

Example policy (restrictive):

```
{
  "default": "deny",
  "allow": ["navigate", "snapshot", "click", "scroll", "wait", "get"]
}
```
  
| Category  | Actions  |  
| --- | --- |  
| `navigate`  | open, back, forward, reload, tab new  |  
| `click`  | click, dblclick, tap  |  
| `fill`  | fill, type, keyboard type/inserttext, select, check, uncheck  |  
| `eval`  | eval, evalhandle, addscript, addinitscript, addstyle, expose, setcontent  |  
| `download`  | download, waitfordownload  |  
| `upload`  | upload  |  
| `snapshot`  | snapshot, screenshot, pdf, diff  |  
| `scroll`  | scroll, scrollintoview  |  
| `wait`  | wait, waitforurl, waitforloadstate, waitforfunction  |  
| `get`  | get text/html/url/title, count, isvisible, getbyrole, getbytext, getbylabel, etc.  |  
| `interact`  | hover, focus, drag, press, keydown, keyup, mousemove, dispatch  |  
| `network`  | network route/unroute, requests, har start/stop  |  
| `state`  | state save/load, cookies set, storage set  |  
Auth vault operations (`auth save`, `auth login`, `auth list`, `auth show`, `auth delete`) and other internal/meta operations bypass action policy enforcement since they are trusted local operations. Domain allowlist restrictions still apply to `auth login` navigations.
## Action Confirmation[#](https://agent-browser.dev/security#action-confirmation)
For actions that require explicit approval, use `--confirm-actions` to specify categories that require confirmation:

```
# Orchestrator mode: returns confirmation_required response
agent-browser --confirm-actions eval,download eval "document.title"

# Then approve or deny:
agent-browser confirm c_8f3a1234
agent-browser deny c_8f3a1234
```

For interactive (human-in-the-loop) confirmation:

```
agent-browser --confirm-actions eval,download --confirm-interactive eval "document.title"
# Prompts: Allow? [y/N]
```

Pending confirmations auto-deny after 60 seconds.
> **Non-TTY behavior:** When `--confirm-interactive` is set but stdin is not a TTY (e.g., piped input or running inside an automated pipeline), actions are automatically denied. This prevents accidental approval in non-interactive contexts.
## Output Length Limits[#](https://agent-browser.dev/security#output-length-limits)
Prevent context flooding by truncating large page outputs:

```
agent-browser --max-output 50000 get text body
# or
export AGENT_BROWSER_MAX_OUTPUT=50000
```

Affected output types: `snapshot`, `get text`, `get html`, `eval`, `console`.
## Environment Variables[#](https://agent-browser.dev/security#environment-variables)  
| Variable  | Description  |  
| --- | --- |  
| `AGENT_BROWSER_CONTENT_BOUNDARIES`  | Wrap page output in boundary markers  |  
| `AGENT_BROWSER_MAX_OUTPUT`  | Max characters for page output  |  
| `AGENT_BROWSER_ALLOWED_DOMAINS`  | Comma-separated allowed domain patterns  |  
| `AGENT_BROWSER_ACTION_POLICY`  | Path to action policy JSON file  |  
| `AGENT_BROWSER_CONFIRM_ACTIONS`  | Comma-separated action categories requiring confirmation  |  
| `AGENT_BROWSER_CONFIRM_INTERACTIVE`  | Enable interactive confirmation prompts  |  
| `AGENT_BROWSER_ENCRYPTION_KEY`  | 64-char hex key for AES-256-GCM encryption (auth vault + sessions)  |  
## Recommended Configuration[#](https://agent-browser.dev/security#recommended-configuration)
For production AI agent deployments:

```
{
  "contentBoundaries": true,
  "maxOutput": 50000,
  "allowedDomains": ["your-app.com", "*.your-app.com"],
  "actionPolicy": "./policy.json"
}
```

Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
