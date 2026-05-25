# https://agent-browser.dev/providers/agentcore

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
AgentCore
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


# AgentCore[#](https://agent-browser.dev/providers/agentcore#agentcore)
[AWS Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/) provides cloud browser sessions with SigV4 authentication. Use it when running agent-browser in AWS environments or when you need managed cloud browsers backed by AWS infrastructure.
## Setup[#](https://agent-browser.dev/providers/agentcore#setup)
Credentials are automatically resolved from:
  1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
  2. AWS CLI (`aws configure export-credentials`) which supports SSO, profiles, IAM roles, etc.



```
agent-browser -p agentcore open https://example.com
```

Or use environment variables for CI/scripts:

```
export AGENT_BROWSER_PROVIDER=agentcore
agent-browser open https://example.com
```

The `-p` flag takes precedence over `AGENT_BROWSER_PROVIDER`.
## Configuration[#](https://agent-browser.dev/providers/agentcore#configuration)  
| Variable  | Description  | Default  |  
| --- | --- | --- |  
| `AGENTCORE_REGION`  | AWS region for the AgentCore endpoint  | `us-east-1`  |  
| `AGENTCORE_BROWSER_ID`  | Browser identifier  | `aws.browser.v1`  |  
| `AGENTCORE_PROFILE_ID`  | Browser profile for persistent state (cookies, localStorage)  | (none)  |  
| `AGENTCORE_SESSION_TIMEOUT`  | Session timeout in seconds  | `3600`  |  
| `AWS_PROFILE`  | AWS CLI profile for credential resolution  | `default`  |  
| `AWS_ACCESS_KEY_ID`  | AWS access key (checked before AWS CLI fallback)  | (none)  |  
| `AWS_SECRET_ACCESS_KEY`  | AWS secret key  | (none)  |  
| `AWS_SESSION_TOKEN`  | Temporary session token (for STS/SSO credentials)  | (none)  |  
## Browser Profiles[#](https://agent-browser.dev/providers/agentcore#browser-profiles)
Use `AGENTCORE_PROFILE_ID` to persist browser state (cookies, localStorage) across sessions:

```
AGENTCORE_PROFILE_ID=my-profile agent-browser -p agentcore open https://example.com
```

When a profile is set, AgentCore stores and restores browser state automatically between sessions.
## Live View[#](https://agent-browser.dev/providers/agentcore#live-view)
When a session starts, AgentCore prints a Live View URL to stderr:

```
Session: abc123-def456
Live View: https://us-east-1.console.aws.amazon.com/bedrock-agentcore/browser/aws.browser.v1/session/abc123-def456#
```

Open this URL in your browser to watch the agent session in real time from the AWS Console.
## Credential Resolution[#](https://agent-browser.dev/providers/agentcore#credential-resolution)
AgentCore uses lightweight manual SigV4 signing (no AWS SDK dependency). Credentials are resolved in order:
  1. **Environment variables** (`AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`, optionally `AWS_SESSION_TOKEN`)
  2. **AWS CLI** (`aws configure export-credentials --format env`), which supports SSO, IAM roles, credential files, and profiles


If using SSO, run `aws sso login` before launching agent-browser. Set `AWS_PROFILE` to select a specific named profile.
## Example[#](https://agent-browser.dev/providers/agentcore#example)

```
# Basic usage (credentials auto-resolved via AWS CLI)
agent-browser -p agentcore open https://example.com

# With a browser profile for persistent login state
AGENTCORE_PROFILE_ID=my-profile agent-browser -p agentcore open https://x.com/home

# With explicit region
AGENTCORE_REGION=eu-west-1 agent-browser -p agentcore open https://example.com

# With SSO profile
AWS_PROFILE=my-sso-profile agent-browser -p agentcore open https://example.com
```

When enabled, agent-browser connects to an AgentCore cloud browser session instead of launching a local browser. All commands work identically.
Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
