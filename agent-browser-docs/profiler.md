# https://agent-browser.dev/profiler

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
Profiler
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


# Profiler[#](https://agent-browser.dev/profiler#profiler)
Capture Chrome DevTools performance profiles during browser automation. Use profiles to diagnose slow page loads, expensive JavaScript, layout thrashing, and other performance bottlenecks in agentic workflows.
## Basic usage[#](https://agent-browser.dev/profiler#basic-usage)

```
# Start profiling
agent-browser profiler start

# Perform actions
agent-browser navigate https://example.com
agent-browser click "#button"

# Stop and save profile
agent-browser profiler stop ./trace.json
```

The output JSON file can be loaded into Chrome DevTools, Perfetto UI, or any tool that accepts Chrome Trace Event format.
## Commands[#](https://agent-browser.dev/profiler#commands)  
| Command  | Description  |  
| --- | --- |  
| `profiler start`  | Start recording a performance profile  |  
| `profiler start --categories <list>`  | Start with custom trace categories  |  
| `profiler stop [path]`  | Stop profiling and save to file  |  
## Trace categories[#](https://agent-browser.dev/profiler#trace-categories)
The `--categories` flag accepts a comma-separated list of Chrome trace categories.

```
agent-browser profiler start --categories "devtools.timeline,v8.execute,blink.user_timing"
```

Default categories include `devtools.timeline`, `v8.execute`, `blink`, `blink.user_timing`, `latencyInfo`, `renderer.scheduler`, `toplevel`, and several `disabled-by-default-*` categories for detailed CPU profiling and call stack analysis.
### Common categories[#](https://agent-browser.dev/profiler#common-categories)  
| Category  | What it captures  |  
| --- | --- |  
| `devtools.timeline`  | Standard DevTools performance events  |  
| `v8.execute`  | Time spent running JavaScript  |  
| `blink`  | Renderer events (layout, paint, style)  |  
| `blink.user_timing`  |  `performance.mark()` and `performance.measure()` calls  |  
| `latencyInfo`  | Input-to-display latency  |  
| `disabled-by-default-v8.cpu_profiler`  | Sampling-based JS CPU profiling  |  
## Output format[#](https://agent-browser.dev/profiler#output-format)
The output is a JSON file in Chrome Trace Event format:

```
{
  "traceEvents": [
    {
      "cat": "devtools.timeline",
      "name": "RunTask",
      "ph": "X",
      "ts": 12345,
      "dur": 100,
      "pid": 1,
      "tid": 1
    }
  ],
  "metadata": {
    "clock-domain": "LINUX_CLOCK_MONOTONIC"
  }
}
```

The `metadata.clock-domain` field reflects the host platform (Linux or macOS). On Windows it is omitted.
## Viewing profiles[#](https://agent-browser.dev/profiler#viewing-profiles)
  * **Chrome DevTools** -- Performance panel > Load profile
  * **Perfetto** -- https://ui.perfetto.dev/ (drag and drop the JSON file)
  * **Trace Viewer** -- `chrome://tracing` in any Chromium browser


## Use cases[#](https://agent-browser.dev/profiler#use-cases)
  * **Page load analysis** -- Profile navigation to identify slow resources, long tasks, or layout shifts
  * **Interaction profiling** -- Measure the cost of clicks, form fills, and other user interactions
  * **CI regression checks** -- Capture profiles per build and compare trace data over time
  * **Agent workflow optimization** -- Find which steps in an agentic flow are most expensive


## Limitations[#](https://agent-browser.dev/profiler#limitations)
  * Only works with Chromium-based browsers (Chrome, Edge). Not supported on Firefox or WebKit.
  * Trace data accumulates in memory while profiling is active (capped at 5 million events). Stop profiling promptly after the area of interest.
  * Data collection on stop has a 30-second timeout. If the browser is unresponsive, the stop command may fail.
  * When no output path is provided, the profile is saved to an auto-generated path under the agent-browser temp directory.


Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
