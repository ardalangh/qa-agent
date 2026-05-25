# https://agent-browser.dev/streaming

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
Streaming
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


# Streaming[#](https://agent-browser.dev/streaming#streaming)
Stream the browser viewport via WebSocket for live preview or "pair browsing" where a human can watch and interact alongside an AI agent.
## Streaming[#](https://agent-browser.dev/streaming#streaming)
Every session automatically starts a WebSocket stream server on an OS-assigned port. The server streams viewport frames and accepts input events (mouse, keyboard, touch).
To bind to a specific port, set `AGENT_BROWSER_STREAM_PORT`:

```
AGENT_BROWSER_STREAM_PORT=9223 agent-browser open example.com
```

You can also manage streaming at runtime:

```
agent-browser stream status            # Show streaming state and bound port
agent-browser stream enable --port 9223  # Re-enable on a specific port
agent-browser stream disable           # Stop streaming for the session
```

`stream status` returns the enabled state, active port, browser connection state, and whether screencasting is active. `stream disable` tears the server down and removes the session's `.stream` metadata file.
## Runtime status response[#](https://agent-browser.dev/streaming#runtime-status-response)
`agent-browser stream status --json` returns data like:

```
{
  "enabled": true,
  "port": 9223,
  "connected": true,
  "screencasting": true
}
```

`connected` reports whether the daemon currently has a browser attached. `screencasting` reports whether frames are actively being produced for the stream server.
## Relationship to screencast commands[#](https://agent-browser.dev/streaming#relationship-to-screencast-commands)
`stream enable` creates the WebSocket server and keeps it available for the session. WebSocket clients then trigger live frame delivery automatically.
The lower-level `screencast_start` and `screencast_stop` commands still control explicit CDP screencasts directly. Use them when you want a screencast without the WebSocket runtime server.
## WebSocket protocol[#](https://agent-browser.dev/streaming#websocket-protocol)
Connect to `ws://localhost:9223` to receive frames and send input.
### Frame messages[#](https://agent-browser.dev/streaming#frame-messages)
The server sends frame messages with base64-encoded images:

```
{
  "type": "frame",
  "data": "<base64-encoded-jpeg>",
  "metadata": {
    "deviceWidth": 1280,
    "deviceHeight": 720,
    "pageScaleFactor": 1,
    "offsetTop": 0,
    "scrollOffsetX": 0,
    "scrollOffsetY": 0
  }
}
```

### Status messages[#](https://agent-browser.dev/streaming#status-messages)
Connection and screencast status:

```
{
  "type": "status",
  "connected": true,
  "screencasting": true,
  "viewportWidth": 1280,
  "viewportHeight": 720
}
```

## Input injection[#](https://agent-browser.dev/streaming#input-injection)
Send input events to control the browser remotely.
### Mouse events[#](https://agent-browser.dev/streaming#mouse-events)

```
// Click
{
  "type": "input_mouse",
  "eventType": "mousePressed",
  "x": 100,
  "y": 200,
  "button": "left",
  "clickCount": 1
}

// Release
{
  "type": "input_mouse",
  "eventType": "mouseReleased",
  "x": 100,
  "y": 200,
  "button": "left"
}

// Move
{
  "type": "input_mouse",
  "eventType": "mouseMoved",
  "x": 150,
  "y": 250
}

// Scroll
{
  "type": "input_mouse",
  "eventType": "mouseWheel",
  "x": 100,
  "y": 200,
  "deltaX": 0,
  "deltaY": 100
}
```

### Keyboard events[#](https://agent-browser.dev/streaming#keyboard-events)

```
// Key down
{
  "type": "input_keyboard",
  "eventType": "keyDown",
  "key": "Enter",
  "code": "Enter"
}

// Key up
{
  "type": "input_keyboard",
  "eventType": "keyUp",
  "key": "Enter",
  "code": "Enter"
}

// Type character
{
  "type": "input_keyboard",
  "eventType": "char",
  "text": "a"
}

// With modifiers (1=Alt, 2=Ctrl, 4=Meta, 8=Shift)
{
  "type": "input_keyboard",
  "eventType": "keyDown",
  "key": "c",
  "code": "KeyC",
  "modifiers": 2
}
```

### Touch events[#](https://agent-browser.dev/streaming#touch-events)

```
// Touch start
{
  "type": "input_touch",
  "eventType": "touchStart",
  "touchPoints": [{ "x": 100, "y": 200 }]
}

// Touch move
{
  "type": "input_touch",
  "eventType": "touchMove",
  "touchPoints": [{ "x": 150, "y": 250 }]
}

// Touch end
{
  "type": "input_touch",
  "eventType": "touchEnd",
  "touchPoints": []
}

// Multi-touch (pinch zoom)
{
  "type": "input_touch",
  "eventType": "touchStart",
  "touchPoints": [
    { "x": 100, "y": 200, "id": 0 },
    { "x": 200, "y": 200, "id": 1 }
  ]
}
```

## Programmatic API[#](https://agent-browser.dev/streaming#programmatic-api)
For advanced use, control streaming directly via the TypeScript API:

```
import { BrowserManager } from 'agent-browser';

const browser = new BrowserManager();
await browser.launch({ headless: true });
await browser.navigate('https://example.com');

// Start screencast with callback
await browser.startScreencast((frame) => {
  console.log('Frame:', frame.metadata.deviceWidth, 'x', frame.metadata.deviceHeight);
  // frame.data is base64-encoded image
}, {
  format: 'jpeg',  // or 'png'
  quality: 80,     // 0-100, jpeg only
  maxWidth: 1280,
  maxHeight: 720,
  everyNthFrame: 1
});

// Inject mouse event
await browser.injectMouseEvent({
  type: 'mousePressed',
  x: 100,
  y: 200,
  button: 'left',
  clickCount: 1
});

// Inject keyboard event
await browser.injectKeyboardEvent({
  type: 'keyDown',
  key: 'Enter',
  code: 'Enter'
});

// Inject touch event
await browser.injectTouchEvent({
  type: 'touchStart',
  touchPoints: [{ x: 100, y: 200 }]
});

// Check if screencasting
console.log('Active:', browser.isScreencasting());

// Stop screencast
await browser.stopScreencast();
```

## Use cases[#](https://agent-browser.dev/streaming#use-cases)
  * **Pair browsing** - Human watches and assists AI agent in real-time
  * **Remote preview** - View browser output in a separate UI
  * **Recording** - Capture frames for video generation
  * **Mobile testing** - Inject touch events for mobile emulation
  * **Accessibility testing** - Manual interaction during automated tests


Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
