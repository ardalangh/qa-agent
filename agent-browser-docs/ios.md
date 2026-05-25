# https://agent-browser.dev/ios

---

[](https://vercel.com "Made with love by Vercel")[agent-browser](https://agent-browser.dev/)
`⌘K`[34k](https://github.com/vercel-labs/agent-browser)[npm](https://www.npmjs.com/package/agent-browser)
iOS Simulator
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


# iOS Simulator[#](https://agent-browser.dev/ios#ios-simulator)
Control real Mobile Safari in the iOS Simulator for authentic mobile web testing. Uses Appium with XCUITest for native automation.
## Requirements[#](https://agent-browser.dev/ios#requirements)
  * macOS with Xcode installed
  * iOS Simulator runtimes (download via Xcode)
  * Appium with XCUITest driver


## Setup[#](https://agent-browser.dev/ios#setup)

```
# Install Appium globally
npm install -g appium

# Install the XCUITest driver for iOS
appium driver install xcuitest
```

## List available devices[#](https://agent-browser.dev/ios#list-available-devices)
See all iOS simulators available on your system:

```
agent-browser device list

# Output:
# Available iOS Simulators:
#
#   ○ iPhone 16 Pro (iOS 18.0)
#     F21EEC0D-7618-419F-811B-33AF27A8B2FD
#   ○ iPhone 16 Pro Max (iOS 18.0)
#     50402807-C9B8-4D37-9F13-2E00E782C744
#   ○ iPad Pro 13-inch (M4) (iOS 18.0)
#     3A6C6436-B909-4593-866D-91D1062BB070
#   ...
```

## Basic usage[#](https://agent-browser.dev/ios#basic-usage)
Use the `-p ios` flag to enable iOS mode. The workflow is identical to desktop:

```
# Launch Safari on iPhone 16 Pro
agent-browser -p ios --device "iPhone 16 Pro" open https://example.com

# Get snapshot with refs (same as desktop)
agent-browser -p ios snapshot -i

# Interact using refs
agent-browser -p ios tap @e1
agent-browser -p ios fill @e2 "text"

# Take screenshot
agent-browser -p ios screenshot mobile.png

# Close session (shuts down simulator)
agent-browser -p ios close
```

## Mobile-specific commands[#](https://agent-browser.dev/ios#mobile-specific-commands)

```
# Swipe gestures
agent-browser -p ios swipe up
agent-browser -p ios swipe down
agent-browser -p ios swipe left
agent-browser -p ios swipe right

# Swipe with distance (pixels)
agent-browser -p ios swipe up 500

# Tap (alias for click, semantically clearer for touch)
agent-browser -p ios tap @e1
```

## Environment variables[#](https://agent-browser.dev/ios#environment-variables)
Configure iOS mode via environment variables:

```
export AGENT_BROWSER_PROVIDER=ios
export AGENT_BROWSER_IOS_DEVICE="iPhone 16 Pro"

# Now all commands use iOS
agent-browser open https://example.com
agent-browser snapshot -i
agent-browser tap @e1
```
  
| Variable  | Description  |  
| --- | --- |  
| `AGENT_BROWSER_PROVIDER`  | Set to `ios` to enable iOS mode  |  
| `AGENT_BROWSER_IOS_DEVICE`  | Device name (e.g., "iPhone 16 Pro")  |  
| `AGENT_BROWSER_IOS_UDID`  | Device UDID (alternative to device name)  |  
## Supported devices[#](https://agent-browser.dev/ios#supported-devices)
All iOS Simulators available in Xcode are supported, including:
  * All iPhone models (iPhone 15, 16, 17, SE, etc.)
  * All iPad models (iPad Pro, iPad Air, iPad mini, etc.)
  * Multiple iOS versions (17.x, 18.x, etc.)


**Real devices** are also supported via USB connection (see below).
## Real device support[#](https://agent-browser.dev/ios#real-device-support)
Appium can control Safari on real iOS devices connected via USB. This requires additional one-time setup.
### 1. Get your device UDID[#](https://agent-browser.dev/ios#1-get-your-device-udid)

```
# List connected devices
xcrun xctrace list devices

# Or via system profiler
system_profiler SPUSBDataType | grep -A 5 "iPhone\|iPad"
```

### 2. Sign WebDriverAgent (one-time)[#](https://agent-browser.dev/ios#2-sign-webdriveragent-one-time)
WebDriverAgent needs to be signed with your Apple Developer certificate to run on real devices.

```
# Open the WebDriverAgent Xcode project
cd ~/.appium/node_modules/appium-xcuitest-driver/node_modules/appium-webdriveragent
open WebDriverAgent.xcodeproj
```

In Xcode:
  1. Select the `WebDriverAgentRunner` target
  2. Go to Signing & Capabilities
  3. Select your Team (requires Apple Developer account, free tier works)
  4. Let Xcode manage signing automatically


### 3. Use with agent-browser[#](https://agent-browser.dev/ios#3-use-with-agent-browser)

```
# Connect device via USB, then use the UDID
agent-browser -p ios --device "<DEVICE_UDID>" open https://example.com

# Or use the device name if unique
agent-browser -p ios --device "John's iPhone" open https://example.com
```

### Real device notes[#](https://agent-browser.dev/ios#real-device-notes)
  * First run installs WebDriverAgent to the device (may require Trust prompt on device)
  * Device must be unlocked and connected via USB
  * Slightly slower initial connection than simulator
  * Tests against real Safari performance and behavior
  * On first install, go to Settings → General → VPN & Device Management to trust the developer certificate


## Performance notes[#](https://agent-browser.dev/ios#performance-notes)
  * **First launch:** Takes 30-60 seconds to boot the simulator and start Appium
  * **Subsequent commands:** Fast (simulator stays running)
  * **Close command:** Shuts down simulator and Appium server


## Differences from desktop[#](https://agent-browser.dev/ios#differences-from-desktop)  
| Feature  | Desktop  | iOS  |  
| --- | --- | --- |  
| Browser  | Chrome, Lightpanda  | Safari only  |  
| Tabs  | Supported  | Single tab only  |  
| PDF export  | Supported  | Not supported  |  
| Screencast  | Supported  | Not supported  |  
| Swipe gestures  | Not native  | Native support  |  
## Troubleshooting[#](https://agent-browser.dev/ios#troubleshooting)
### Appium not found[#](https://agent-browser.dev/ios#appium-not-found)

```
# Make sure Appium is installed globally
npm install -g appium
appium driver install xcuitest

# Verify installation
appium --version
```

### No simulators available[#](https://agent-browser.dev/ios#no-simulators-available)
Open Xcode and download iOS Simulator runtimes from **Settings → Platforms**.
### Simulator won't boot[#](https://agent-browser.dev/ios#simulator-wont-boot)
Try booting the simulator manually from Xcode or the Simulator app to ensure it works, then retry with agent-browser.
Ask AI`⌘I`
agent-browser Docs
What is agent-browser?How do I install it?What commands are available?How do snapshots work?How do I use CDP mode?
