# https://agent-browser.dev/sessions

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
Sessions
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


# Sessions[#](https://agent-browser.dev/sessions#sessions)
Run multiple isolated browser instances:

```
# Different sessions
agent-browser --session agent1 open site-a.com
agent-browser --session agent2 open site-b.com

# Or via environment variable
AGENT_BROWSER_SESSION=agent1 agent-browser click "#btn"

# List active sessions
agent-browser session list
# Output:
# Active sessions:
# -> default
#    agent1

# Show current session
agent-browser session
```

## Session isolation[#](https://agent-browser.dev/sessions#session-isolation)
Each session has its own:
  * Browser instance
  * Cookies and storage
  * Navigation history
  * Authentication state


## Chrome profile reuse[#](https://agent-browser.dev/sessions#chrome-profile-reuse)
The simplest way to reuse your existing login state: pass a Chrome profile name to `--profile`. agent-browser copies the profile to a temp directory (read-only snapshot) and launches Chrome with your existing cookies and sessions.

```
# List available Chrome profiles
agent-browser profiles

# Reuse your default Chrome profile's login state
agent-browser --profile Default open https://gmail.com

# Use a named profile (by display name or directory name)
agent-browser --profile "Work" open https://app.example.com

# Or via environment variable
AGENT_BROWSER_PROFILE=Default agent-browser open https://gmail.com
```
  
| Detail  | Description  |  
| --- | --- |  
| Supported browsers  | Chrome, Chrome Canary, Chromium, Brave  |  
| What's copied  | Cookies, local storage, extensions state (cache dirs excluded for speed)  |  
| Original profile  | Never modified (read-only snapshot)  |  
| Cleanup  | Temp copy deleted when browser closes  |  
| Windows note  | Close Chrome before using `--profile <name>` if Chrome is running  |  
## Persistent profiles[#](https://agent-browser.dev/sessions#persistent-profiles)
For a custom profile directory that persists state across browser restarts, pass a path to `--profile`:

```
# Use a persistent profile directory
agent-browser --profile ~/.myapp-profile open myapp.com

# Login once, then reuse the authenticated session
agent-browser --profile ~/.myapp-profile open myapp.com/dashboard

# Or via environment variable
AGENT_BROWSER_PROFILE=~/.myapp-profile agent-browser open myapp.com
```

The profile directory stores:
  * Cookies and localStorage
  * IndexedDB data
  * Service workers
  * Browser cache
  * Login sessions


## Import auth from your browser[#](https://agent-browser.dev/sessions#import-auth-from-your-browser)
If you are already logged in to a site in Chrome, you can grab that auth state and reuse it in agent-browser. This is the fastest way to bypass login flows, OAuth, SSO, or 2FA.
**Step 1:** Start Chrome with remote debugging:

```
# macOS
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222

# Linux
google-chrome --remote-debugging-port=9222
```

Log in to your target site(s) in this Chrome window.
`--remote-debugging-port` exposes full browser control on localhost. Any local process can connect. Only use on trusted machines and close Chrome when done.
**Step 2:** Connect and save the authenticated state:

```
agent-browser --auto-connect state save ./my-auth.json
```

**Step 3:** Use the saved auth in future sessions:

```
# Load auth at launch
agent-browser --state ./my-auth.json open https://app.example.com/dashboard

# Or load into an existing session
agent-browser state load ./my-auth.json
agent-browser open https://app.example.com/dashboard
```

Combine with `--session-name` so the imported auth auto-persists across restarts:

```
agent-browser --session-name myapp state load ./my-auth.json
# From now on, state auto-saves/restores for "myapp"
```

State files contain session tokens in plaintext. Add them to `.gitignore` and delete when no longer needed. For encryption at rest, see [State encryption](https://agent-browser.dev/sessions#state-encryption) below.
## Session persistence[#](https://agent-browser.dev/sessions#session-persistence)
Use `--session-name` to automatically save and restore cookies and localStorage across browser restarts:

```
# Auto-save/load state for "twitter" session
agent-browser --session-name twitter open twitter.com

# Login once, then state persists automatically
agent-browser --session-name twitter click "#login"

# Or via environment variable
export AGENT_BROWSER_SESSION_NAME=twitter
agent-browser open twitter.com
```

State files are stored in `~/.agent-browser/sessions/` and automatically loaded on daemon start.
### Session name rules[#](https://agent-browser.dev/sessions#session-name-rules)
Session names must contain only alphanumeric characters, hyphens, and underscores:

```
# Valid session names
agent-browser --session-name my-project open example.com
agent-browser --session-name test_session_v2 open example.com

# Invalid (will be rejected)
agent-browser --session-name "../bad" open example.com    # path traversal
agent-browser --session-name "my session" open example.com # spaces
agent-browser --session-name "foo/bar" open example.com    # slashes
```

## State encryption[#](https://agent-browser.dev/sessions#state-encryption)
Encrypt saved state files (cookies, localStorage) using AES-256-GCM:

```
# Generate a 256-bit key (64 hex characters)
openssl rand -hex 32

# Set the encryption key
export AGENT_BROWSER_ENCRYPTION_KEY=<your-64-char-hex-key>

# State files are now encrypted automatically
agent-browser --session-name secure-session open example.com

# List states shows encryption status
agent-browser state list
```

## State auto-expiration[#](https://agent-browser.dev/sessions#state-auto-expiration)
Automatically delete old state files to prevent accumulation:

```
# Set expiration (default: 30 days)
export AGENT_BROWSER_STATE_EXPIRE_DAYS=7

# Manually clean old states
agent-browser state clean --older-than 7
```

## State management commands[#](https://agent-browser.dev/sessions#state-management-commands)

```
# List all saved states
agent-browser state list

# Show state summary (cookies, origins, domains)
agent-browser state show my-session-default.json

# Rename a state file
agent-browser state rename old-name new-name

# Clear states for a specific session name
agent-browser state clear my-session

# Clear all saved states
agent-browser state clear --all

# Manual save/load (for custom paths)
agent-browser state save ./backup.json
agent-browser state load ./backup.json
```

## Authenticated sessions[#](https://agent-browser.dev/sessions#authenticated-sessions)
Use `--headers` to set HTTP headers for a specific origin:

```
# Headers scoped to api.example.com only
agent-browser open api.example.com --headers '{"Authorization": "Bearer <token>"}'

# Requests to api.example.com include the auth header
agent-browser snapshot -i --json
agent-browser click @e2

# Navigate to another domain - headers NOT sent
agent-browser open other-site.com
```

Useful for:
  * **Skipping login flows** - Authenticate via headers
  * **Switching users** - Different auth tokens per session
  * **API testing** - Access protected endpoints
  * **Security** - Headers scoped to origin, not leaked


## Multiple origins[#](https://agent-browser.dev/sessions#multiple-origins)

```
agent-browser open api.example.com --headers '{"Authorization": "Bearer token1"}'
agent-browser open api.acme.com --headers '{"Authorization": "Bearer token2"}'
```

## Global headers[#](https://agent-browser.dev/sessions#global-headers)
For headers on all domains:

```
agent-browser set headers '{"X-Custom-Header": "value"}'
```

## Environment variables[#](https://agent-browser.dev/sessions#environment-variables)  
| Variable  | Description  |  
| --- | --- |  
| `AGENT_BROWSER_SESSION`  | Browser session ID (default: "default")  |  
| `AGENT_BROWSER_SESSION_NAME`  | Auto-save/load state persistence name  |  
| `AGENT_BROWSER_ENCRYPTION_KEY`  | 64-char hex key for AES-256-GCM encryption  |  
| `AGENT_BROWSER_STATE_EXPIRE_DAYS`  | Auto-delete states older than N days (default: 30)  |  
Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
