# Slack Themes

Custom CSS themes for the Slack desktop app on macOS.

![GitHub Dark High Contrast Theme](https://img.shields.io/badge/theme-GitHub%20Dark%20High%20Contrast-0a0c10)

## Features

- **YAML-based themes** — Simple configuration format for colors and fonts
- **Hot reloading** — Apply theme changes without restarting Slack
- **Multiple themes** — Switch between themes by editing one file
- **Persistent** — Theme reapplies automatically on Slack launch
- **No app modification** — Uses Chrome DevTools Protocol, doesn't modify Slack's code

## Quick Start

### Prerequisites

- macOS
- Node.js 18+
- Slack desktop app

### Installation

```bash
# Clone the repository
git clone https://github.com/poiley/slack-themes.git ~/.config/slack

# Install dependencies
cd ~/.config/slack
npm install ws

# Start Slack with theming enabled
./start-slack.sh
```

### Apply Theme Changes

After editing `theme.yaml`:

```bash
node inject-css.js
```

## Configuration

### Theme File (`theme.yaml`)

Edit `theme.yaml` to customize your theme:

```yaml
name: My Custom Theme

colors:
  # Backgrounds
  bg: "#0a0c10"           # Main background
  bg-subtle: "#1a2029"    # Hover states, subtle backgrounds

  # Borders
  border: "#3d444d"       # Primary borders
  border-muted: "#2a313a" # Subtle borders

  # Text
  fg: "#f0f3f6"           # Primary text
  fg-muted: "#9ea7b3"     # Secondary text
  fg-subtle: "#7a828e"    # Tertiary text (timestamps, etc.)

  # Accent colors
  accent: "#71b7ff"       # Links, highlights
  accent-bright: "#91cbff" # Hover states

  # Semantic colors
  red: "#ff9492"          # Errors, unread badges
  green: "#26cd4d"        # Online status
  yellow: "#f0b72f"       # Warnings, away status
  purple: "#cb9eff"       # Special highlights
  cyan: "#39c5cf"         # Info

font:
  family: '"SF Mono", Consolas, monospace'
```

### Example Themes

<details>
<summary><strong>GitHub Dark High Contrast</strong></summary>

```yaml
name: GitHub Dark High Contrast

colors:
  bg: "#0a0c10"
  bg-subtle: "#1a2029"
  border: "#3d444d"
  border-muted: "#2a313a"
  fg: "#f0f3f6"
  fg-muted: "#9ea7b3"
  fg-subtle: "#7a828e"
  accent: "#71b7ff"
  accent-bright: "#91cbff"
  red: "#ff9492"
  green: "#26cd4d"
  yellow: "#f0b72f"
  purple: "#cb9eff"
  cyan: "#39c5cf"

font:
  family: '"SF Mono", Consolas, monospace'
```
</details>

<details>
<summary><strong>Dracula</strong></summary>

```yaml
name: Dracula

colors:
  bg: "#282a36"
  bg-subtle: "#44475a"
  border: "#6272a4"
  border-muted: "#44475a"
  fg: "#f8f8f2"
  fg-muted: "#6272a4"
  fg-subtle: "#6272a4"
  accent: "#bd93f9"
  accent-bright: "#ff79c6"
  red: "#ff5555"
  green: "#50fa7b"
  yellow: "#f1fa8c"
  purple: "#bd93f9"
  cyan: "#8be9fd"

font:
  family: '"Fira Code", monospace'
```
</details>

<details>
<summary><strong>Nord</strong></summary>

```yaml
name: Nord

colors:
  bg: "#2e3440"
  bg-subtle: "#3b4252"
  border: "#4c566a"
  border-muted: "#434c5e"
  fg: "#eceff4"
  fg-muted: "#d8dee9"
  fg-subtle: "#a5b1c2"
  accent: "#88c0d0"
  accent-bright: "#8fbcbb"
  red: "#bf616a"
  green: "#a3be8c"
  yellow: "#ebcb8b"
  purple: "#b48ead"
  cyan: "#88c0d0"

font:
  family: '"JetBrains Mono", monospace'
```
</details>

<details>
<summary><strong>Catppuccin Mocha</strong></summary>

```yaml
name: Catppuccin Mocha

colors:
  bg: "#1e1e2e"
  bg-subtle: "#313244"
  border: "#45475a"
  border-muted: "#313244"
  fg: "#cdd6f4"
  fg-muted: "#a6adc8"
  fg-subtle: "#6c7086"
  accent: "#89b4fa"
  accent-bright: "#b4befe"
  red: "#f38ba8"
  green: "#a6e3a1"
  yellow: "#f9e2af"
  purple: "#cba6f7"
  cyan: "#94e2d5"

font:
  family: '"Cascadia Code", monospace'
```
</details>

<details>
<summary><strong>Solarized Dark</strong></summary>

```yaml
name: Solarized Dark

colors:
  bg: "#002b36"
  bg-subtle: "#073642"
  border: "#586e75"
  border-muted: "#073642"
  fg: "#fdf6e3"
  fg-muted: "#93a1a1"
  fg-subtle: "#657b83"
  accent: "#268bd2"
  accent-bright: "#2aa198"
  red: "#dc322f"
  green: "#859900"
  yellow: "#b58900"
  purple: "#6c71c4"
  cyan: "#2aa198"

font:
  family: '"Source Code Pro", monospace'
```
</details>

<details>
<summary><strong>One Dark</strong></summary>

```yaml
name: One Dark

colors:
  bg: "#282c34"
  bg-subtle: "#3e4451"
  border: "#4b5263"
  border-muted: "#3e4451"
  fg: "#abb2bf"
  fg-muted: "#828997"
  fg-subtle: "#5c6370"
  accent: "#61afef"
  accent-bright: "#56b6c2"
  red: "#e06c75"
  green: "#98c379"
  yellow: "#e5c07b"
  purple: "#c678dd"
  cyan: "#56b6c2"

font:
  family: '"Fira Code", monospace'
```
</details>

## Usage

### Manual Launch

```bash
# Start Slack with debugging enabled
/Applications/Slack.app/Contents/MacOS/Slack --remote-debugging-port=9222 &

# Wait for Slack to load, then inject theme
node ~/.config/slack/inject-css.js
```

### Automatic Launch (Recommended)

Use the included `start-slack.sh` script:

```bash
~/.config/slack/start-slack.sh
```

This script:
1. Starts Slack with debugging enabled
2. Waits for Slack to fully load
3. Automatically injects the theme

### Dock App (Optional)

For convenience, you can use the included `SlackThemed.app` wrapper:

1. Copy `SlackThemed.app` to `/Applications`
2. Replace Slack in your Dock with SlackThemed
3. Optionally, change the app icon to match Slack

The wrapper app launches Slack with theming automatically applied.

## How It Works

This project uses the [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) to inject CSS into Slack's Electron-based desktop app.

1. Slack is launched with `--remote-debugging-port=9222`
2. The inject script connects via WebSocket to the DevTools endpoint
3. CSS is injected into the page using `Runtime.evaluate`
4. A `<style>` element is added to the document head

**No files in the Slack app are modified.** The CSS injection happens at runtime and doesn't affect Slack's code signature or require any special permissions.

## File Structure

```
~/.config/slack/
├── theme.yaml          # Your theme configuration
├── base.css            # CSS selectors (edit to add new elements)
├── inject-css.js       # Injection script
├── start-slack.sh      # Launch script
├── SlackThemed.app/    # Optional Dock wrapper app
└── README.md           # This file
```

## Troubleshooting

### Theme not applying

1. Make sure Slack is running with debugging enabled:
   ```bash
   curl -s http://127.0.0.1:9222/json | head -5
   ```
   If this returns JSON, debugging is enabled.

2. Run the injection script manually:
   ```bash
   node ~/.config/slack/inject-css.js
   ```

### Theme disappears after navigating

The theme may need to be reinjected after certain navigation events. Run `node inject-css.js` again.

### Slack won't start

If Slack crashes on launch:
```bash
# Kill any existing Slack processes
pkill -x Slack

# Start fresh
./start-slack.sh
```

### Changes not visible

After editing `theme.yaml`, you must rerun the injection:
```bash
node inject-css.js
```

## Advanced

### Adding New Selectors

If you find UI elements that aren't themed, you can add selectors to `base.css`:

1. Open Slack's DevTools: Navigate to `http://127.0.0.1:9222` in Chrome
2. Click the Slack page target to open DevTools
3. Inspect the element to find its class name
4. Add the selector to the appropriate section in `base.css`
5. Use `var(--theme-*)` variables for colors

### Creating a Theme Pack

To share multiple themes:

```
themes/
├── github-dark-high-contrast.yaml
├── dracula.yaml
├── nord.yaml
└── catppuccin-mocha.yaml
```

Copy your preferred theme to `theme.yaml` to activate it.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Ideas for Contributions

- Additional theme presets
- New CSS selectors for unstyled elements
- Linux/Windows support
- Theme switching CLI tool
- Live theme preview

## License

MIT License - See [LICENSE](LICENSE) for details.

## Acknowledgments

- Theme colors from [GitHub Primer](https://primer.style/primitives/colors), [Dracula](https://draculatheme.com/), [Nord](https://nordtheme.com/), [Catppuccin](https://catppuccin.com/), and other popular themes
