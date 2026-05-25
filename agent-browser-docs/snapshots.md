# https://agent-browser.dev/snapshots

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
Snapshots
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


# Snapshots[#](https://agent-browser.dev/snapshots#snapshots)
The `snapshot` command returns a compact accessibility tree with refs for element interaction.
## Options[#](https://agent-browser.dev/snapshots#options)
Filter output to reduce size:

```
agent-browser snapshot                    # Full accessibility tree
agent-browser snapshot -i                 # Interactive elements only (recommended)
agent-browser snapshot -c                 # Compact (remove empty elements)
agent-browser snapshot -d 3               # Limit depth to 3 levels
agent-browser snapshot -s "#main"         # Scope to CSS selector
agent-browser snapshot -i -c -d 5         # Combine options
```
  
| Option  | Description  |  
| --- | --- |  
| `-i, --interactive`  | Only interactive elements (buttons, links, inputs)  |  
| `-u, --urls`  | Include href URLs for link elements  |  
| `-c, --compact`  | Remove empty structural elements  |  
| `-d, --depth`  | Limit tree depth  |  
| `-s, --selector`  | Scope to CSS selector  |  
## Output format[#](https://agent-browser.dev/snapshots#output-format)
The default text output is compact and AI-friendly:

```
agent-browser snapshot -i
# Output:
# @e1 [heading] "Example Domain" [level=1]
# @e2 [button] "Submit"
# @e3 [input type="email"] placeholder="Email"
# @e4 [link] "Learn more"
```

## Using refs[#](https://agent-browser.dev/snapshots#using-refs)
Refs from the snapshot map directly to commands:

```
agent-browser click @e2      # Click the Submit button
agent-browser fill @e3 "a@b.com"  # Fill the email input
agent-browser get text @e1        # Get heading text
```

## Ref lifecycle[#](https://agent-browser.dev/snapshots#ref-lifecycle)
Refs are invalidated when the page changes. Always re-snapshot after navigation or DOM updates:

```
agent-browser click @e4      # Navigates to new page
agent-browser snapshot -i    # Get fresh refs
agent-browser click @e1      # Use new refs
```

## Annotated screenshots[#](https://agent-browser.dev/snapshots#annotated-screenshots)
For visual context alongside text snapshots, use `screenshot --annotate` to overlay numbered labels on interactive elements. Each label `[N]` maps to ref `@eN`:
In native mode, annotated screenshots currently work on the CDP-backed browser path (Chromium/Lightpanda). The Safari/WebDriver backend does not yet support `--annotate`.

```
agent-browser screenshot --annotate ./page.png
# -> Screenshot saved to ./page.png
#    [1] @e1 button "Submit"
#    [2] @e2 link "Home"
#    [3] @e3 textbox "Email"
agent-browser click @e2
```

Annotated screenshots also cache refs, so you can interact with elements immediately. This is useful when the text snapshot is insufficient -- unlabeled icons, canvas content, or visual layout verification.
## Iframes[#](https://agent-browser.dev/snapshots#iframes)
Snapshots automatically detect and inline iframe content. Each `Iframe` node in the main frame is resolved and its child accessibility tree is included directly beneath it. Refs assigned to elements inside iframes carry frame context, so interactions work without switching frames first.

```
agent-browser snapshot -i
# @e1 [heading] "Checkout"
# @e2 [Iframe] "payment-frame"
#   @e3 [input] "Card number"
#   @e4 [button] "Pay"

agent-browser fill @e3 "4111111111111111"
agent-browser click @e4
```

Only one level of iframe nesting is expanded. Cross-origin iframes that block accessibility tree access and empty iframes are silently omitted.
To scope a snapshot to a single iframe, switch into it first:

```
agent-browser frame @e2
agent-browser snapshot -i       # Only elements inside that iframe
agent-browser frame main        # Return to main frame
```

## Best practices[#](https://agent-browser.dev/snapshots#best-practices)
  1. Use `-i` to reduce output to actionable elements
  2. Re-snapshot after page changes to get updated refs
  3. Scope with `-s` for specific page sections
  4. Use `-d` to limit depth on complex pages
  5. Use `screenshot --annotate` when visual context is needed alongside refs


## JSON output[#](https://agent-browser.dev/snapshots#json-output)
For programmatic parsing in scripts:

```
agent-browser snapshot --json
# {"success":true,"data":{"snapshot":"...","refs":{"e1":{"role":"heading","name":"Title"},...}}}
```

Note: JSON uses more tokens than text output. The default text format is preferred for AI agents.
Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
