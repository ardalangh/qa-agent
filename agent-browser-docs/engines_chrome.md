# https://agent-browser.dev/engines/chrome

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
Chrome
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


# Chrome[#](https://agent-browser.dev/engines/chrome#chrome)
Chrome (and Chromium) is the default browser engine. agent-browser discovers, launches, and manages the Chrome process automatically via the Chrome DevTools Protocol (CDP).
## Binary Discovery[#](https://agent-browser.dev/engines/chrome#binary-discovery)
When no `--executable-path` is provided, agent-browser searches for Chrome in this order:  
| Platform  | Locations checked  |  
| --- | --- |  
| macOS  | `/Applications/Google Chrome.app`, `/Applications/Google Chrome Canary.app`, `/Applications/Chromium.app`, `/Applications/Brave Browser.app`, Puppeteer cache (`~/.cache/puppeteer/chrome/` or `PUPPETEER_CACHE_DIR`), Chrome for Testing cache  |  
| Linux  | `google-chrome`, `google-chrome-stable`, `chromium-browser`, `chromium` in PATH, Puppeteer cache (`~/.cache/puppeteer/chrome/` or `PUPPETEER_CACHE_DIR`), Chrome for Testing cache  |  
| Windows  | `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe`, `C:\Program Files\Google\Chrome\Application\chrome.exe`, `C:\Program Files (x86)...\chrome.exe`  |  
If Chrome is not found, run `agent-browser install` to download Chrome from Chrome for Testing.
## Usage[#](https://agent-browser.dev/engines/chrome#usage)
Chrome is the default engine -- no `--engine` flag is needed:

```
agent-browser open example.com
```

To be explicit:

```
agent-browser --engine chrome open example.com
```

## Custom Binary[#](https://agent-browser.dev/engines/chrome#custom-binary)
Point to any Chromium-based browser with `--executable-path`:

```
agent-browser --executable-path /path/to/chromium open example.com
```

Or via environment variable:

```
export AGENT_BROWSER_EXECUTABLE_PATH=/path/to/chromium
agent-browser open example.com
```

## Chrome-Specific Features[#](https://agent-browser.dev/engines/chrome#chrome-specific-features)
These features are available only with Chrome:  
| Feature  | Flag  |  
| --- | --- |  
| Browser extensions  | `--extension <path>`  |  
| Persistent profiles  |  `--profile <path>` (sets Chrome's `--user-data-dir`)  |  
| Storage state  | `--state <path>`  |  
| File URL access  | `--allow-file-access`  |  
| Headed mode  | `--headed`  |  
| Custom launch args  | `--args <args>`  |  
## Containers and CI[#](https://agent-browser.dev/engines/chrome#containers-and-ci)
In Docker, CI runners, or other sandboxed environments, Chrome's user namespace sandbox may need to be disabled:

```
agent-browser --args "--no-sandbox" open example.com
```

agent-browser automatically adds `--no-sandbox` when it detects a container environment (Docker, Podman, running as root).
Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
