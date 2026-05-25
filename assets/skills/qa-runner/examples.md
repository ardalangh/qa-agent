# QA Scenario Examples

## Login Flow

```yaml
name: login-happy-path
description: User can log in with valid credentials
tags: [smoke, auth]

requires:
  env: any
  user_role: customer

steps:
  - open: "{baseUrl}/login"
  - wait: { load: networkidle }

  - find: { label: "Email", action: fill, value: "test@example.com" }
  - find: { label: "Password", action: fill, value: "password123" }
  - find: { role: button, name: "Sign in", action: click }

  - wait: { url: "**/dashboard" }
  - expect: { visible: "[data-testid='user-menu']" }
  - screenshot: logged-in.png
```

## Checkout Flow

```yaml
name: checkout-happy-path
description: Customer can complete checkout
tags: [smoke, checkout]

requires:
  user_role: customer
  env: staging

viewport: { w: 1440, h: 900 }

setup:
  - login: true

steps:
  - open: "{baseUrl}/products"
  - wait: { load: networkidle }

  - find: { testid: "product-card", action: click }
  - wait: { url: "**/product/**" }

  - find: { role: button, name: "Add to cart", action: click }
  - wait: { text: "Added to cart" }

  - find: { role: link, name: "Cart", action: click }
  - wait: { url: "**/cart" }
  - expect: { count: { selector: "[data-testid='cart-item']", gte: 1 } }

  - find: { role: button, name: "Checkout", action: click }
  - wait: { url: "**/checkout" }
  - screenshot: checkout.png
```

## Search Functionality

```yaml
name: search-products
description: Search returns relevant results
tags: [search]

requires:
  env: any

steps:
  - open: "{baseUrl}/"
  - wait: { load: networkidle }

  - find: { placeholder: "Search", action: fill, value: "laptop" }
  - press: "Enter"

  - wait: { url: "**/search**" }
  - expect: { visible: "[data-testid='search-results']" }
  - expect: { count: { selector: ".product-card", gte: 1 } }
  - expect: { text: { selector: "h1", contains: "laptop" } }
  - screenshot: search-results.png
```

## Form Validation

```yaml
name: form-validation
description: Form shows validation errors for invalid input
tags: [forms]

requires:
  env: any

steps:
  - open: "{baseUrl}/contact"
  - wait: { load: networkidle }

  # Submit empty form
  - find: { role: button, name: "Submit", action: click }

  # Check validation errors appear
  - expect: { visible: ".error-message" }
  - expect: { text: { selector: ".error-message", contains: "required" } }

  # Fill invalid email
  - find: { label: "Email", action: fill, value: "invalid-email" }
  - find: { role: button, name: "Submit", action: click }
  - expect: { text: { selector: ".error-message", contains: "valid email" } }
  - screenshot: validation-errors.png
```

## Mobile Responsive

```yaml
name: mobile-navigation
description: Mobile navigation menu works correctly
tags: [mobile, responsive]

requires:
  env: any

viewport: { w: 375, h: 812 }

steps:
  - open: "{baseUrl}/"
  - wait: { load: networkidle }

  # Desktop nav should be hidden
  - expect: { not_visible: "nav.desktop-nav" }

  # Mobile menu button should be visible
  - expect: { visible: "[data-testid='mobile-menu-button']" }

  # Open mobile menu
  - click: "[data-testid='mobile-menu-button']"
  - wait: { selector: "[data-testid='mobile-menu']" }
  - expect: { visible: "[data-testid='mobile-menu']" }
  - screenshot: mobile-menu.png

  # Navigate via mobile menu
  - find: { role: link, name: "Products", action: click }
  - wait: { url: "**/products" }
```
