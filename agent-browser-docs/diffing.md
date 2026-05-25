# https://agent-browser.dev/diffing

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
Diffing
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


# Diffing[#](https://agent-browser.dev/diffing#diffing)
Compare page states to detect changes -- structurally via accessibility tree snapshots, visually via pixel comparison, or across two different URLs.
Verify an action changed the page
$ agent-browser snapshot -i
$ agent-browser fill @e3 "test@example.com"
$ agent-browser click @e4
$ agent-browser diff snapshot
heading "Sign Up" [ref=e1]
text "Create your account" [ref=e2]
- textbox "Email" [ref=e3]
+ textbox "Email" [ref=e3]: "test@example.com"
- button "Submit" [ref=e4]
+ button "Submit" [ref=e4] [disabled]
+ status "Sending..." [ref=e7]
link "Already have an account?" [ref=e5]
3 additions, 2 removals, 3 unchanged
Catch a visual regression
$ agent-browser diff screenshot --baseline before-deploy.png
✗ 2.37% pixels differ
Diff image: ~/.agent-browser/tmp/diffs/diff-1708473621.png
1,137 different / 48,000 total pixels
Baseline
Submit
Current
Submit
Diff
Submit
## Commands[#](https://agent-browser.dev/diffing#commands)  
| Command  | Description  |  
| --- | --- |  
| `diff snapshot`  | Compare current snapshot to last snapshot in session  |  
| `diff snapshot --baseline <file>`  | Compare current snapshot to a saved file  |  
| `diff screenshot --baseline <file>`  | Visual pixel diff against a baseline image  |  
| `diff url <url1> <url2>`  | Compare two pages (snapshot + optional screenshot)  |  
## Snapshot diff[#](https://agent-browser.dev/diffing#snapshot-diff)
Compares the accessibility tree between two points in time using a line-level text diff.

```
# Compare against the last snapshot taken in this session
agent-browser diff snapshot

# Compare against a saved baseline file
agent-browser diff snapshot --baseline before.txt

# Scope to a specific part of the page
agent-browser diff snapshot --selector "#main" --compact
```

Without `--baseline`, the command automatically compares against the most recent snapshot taken in the current session. This is the primary use case for agents verifying that an action had the intended effect.
### Options[#](https://agent-browser.dev/diffing#options)  
| Flag  | Description  |  
| --- | --- |  
| `-b, --baseline <file>`  | Path to a saved snapshot file to compare against  |  
| `-s, --selector <sel>`  | Scope the current snapshot to a CSS selector or @ref  |  
| `-c, --compact`  | Use compact snapshot format  |  
| `-d, --depth <n>`  | Limit snapshot tree depth  |  
### Output[#](https://agent-browser.dev/diffing#output)
The diff uses `+` for added lines and `-` for removed lines, similar to unified diff format. A summary line shows the count of additions, removals, and unchanged lines.

```
- button "Submit" [ref=e2]
+ button "Submit" [ref=e2] [disabled]
  3 additions, 2 removals, 41 unchanged
```

## Screenshot diff[#](https://agent-browser.dev/diffing#screenshot-diff)
Compares the current page screenshot against a baseline image at the pixel level. Produces a diff image with changed pixels highlighted in red.

```
# Basic visual diff
agent-browser diff screenshot --baseline before.png

# Save diff image to a specific path
agent-browser diff screenshot --baseline before.png --output diff.png

# Adjust threshold and scope to element
agent-browser diff screenshot --baseline before.png --threshold 0.2 --selector "#hero"
```

### Options[#](https://agent-browser.dev/diffing#options)  
| Flag  | Description  |  
| --- | --- |  
| `-b, --baseline <file>`  | Baseline PNG/JPEG image to compare against (required)  |  
| `-o, --output <file>`  | Path for the generated diff image (default: temp dir)  |  
| `-t, --threshold <0-1>`  | Color distance threshold (default: 0.1). Higher = more tolerant  |  
| `-s, --selector <sel>`  | Scope the current screenshot to an element  |  
| `--full`  | Take a full-page screenshot  |  
### Output[#](https://agent-browser.dev/diffing#output)
Reports the diff image path, number of different pixels, and mismatch percentage. The diff image shows unchanged pixels dimmed with changed pixels in red.
If the baseline and current images have different dimensions, the command reports a dimension mismatch instead of attempting pixel comparison.
## URL diff[#](https://agent-browser.dev/diffing#url-diff)
Compares two pages by navigating to each in sequence and diffing the results.

```
# Compare two URLs (snapshot diff)
agent-browser diff url https://staging.example.com https://prod.example.com

# Include visual comparison
agent-browser diff url https://v1.example.com https://v2.example.com --screenshot

# Full-page screenshot comparison
agent-browser diff url https://v1.example.com https://v2.example.com --screenshot --full
```

The command navigates to the first URL, captures state, then navigates to the second URL and captures again. Snapshot diff is always included. Screenshot diff requires the `--screenshot` flag.
After completion, the browser remains on the second URL.
### Options[#](https://agent-browser.dev/diffing#options)  
| Flag  | Description  |  
| --- | --- |  
| `--screenshot`  | Also perform visual screenshot comparison  |  
| `--full`  | Use full-page screenshots  |  
| `--wait-until <strategy>`  | Navigation wait strategy: `load`, `domcontentloaded`, `networkidle` (default: `load`)  |  
| `-s, --selector <sel>`  | Scope snapshots to a CSS selector or @ref  |  
| `-c, --compact`  | Use compact snapshot format  |  
| `-d, --depth <n>`  | Limit snapshot tree depth  |  
## Use cases[#](https://agent-browser.dev/diffing#use-cases)
### Verifying agent actions[#](https://agent-browser.dev/diffing#verifying-agent-actions)
The most common use case: confirm that an action (click, fill, submit) changed the page as expected.

```
agent-browser snapshot -i          # Take interactive-only snapshot (baseline)
agent-browser fill @e3 "test@example.com"
agent-browser diff snapshot        # Compare current snapshot to the baseline
```

### Monitoring for changes[#](https://agent-browser.dev/diffing#monitoring-for-changes)
Periodically compare a page against a saved baseline to detect updates.

```
# Save baseline
agent-browser open https://example.com && agent-browser snapshot > baseline.txt

# Later, check for changes
agent-browser open https://example.com && agent-browser diff snapshot --baseline baseline.txt
```

### Visual regression testing[#](https://agent-browser.dev/diffing#visual-regression-testing)
Compare screenshots before and after a deploy to catch unintended visual changes.

```
agent-browser open https://staging.example.com && agent-browser screenshot baseline.png
# ... deploy happens ...
agent-browser open https://staging.example.com && agent-browser diff screenshot --baseline baseline.png
```

### Comparing environments[#](https://agent-browser.dev/diffing#comparing-environments)
Diff staging against production to verify parity.

```
agent-browser diff url https://staging.example.com https://prod.example.com --screenshot
```

Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
