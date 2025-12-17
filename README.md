# Slack Themes

Custom CSS themes for the Slack desktop app on macOS.

![GitHub Dark High Contrast Theme](https://img.shields.io/badge/theme-GitHub%20Dark%20High%20Contrast-0a0c10)

## Features

- **YAML-based themes** — Simple configuration format for colors and fonts
- **Hot reloading** — Apply theme changes without restarting Slack
- **Multiple themes** — Switch between themes by editing one file
- **Persistent** — Theme reapplies automatically on Slack launch
- **No app modification** — Uses Chrome DevTools Protocol, doesn't modify Slack's code

## Installation

### Prerequisites

- macOS
- Node.js 18+
- Slack desktop app

### Setup

```bash
# Clone the repository
git clone https://github.com/poiley/slack-themes.git ~/.config/slack

# Install dependencies
cd ~/.config/slack
npm install

# Copy the themed launcher to Applications
cp -r SlackThemed.app /Applications/
```

### Replace Slack in Your Dock

1. Remove the original Slack from your Dock
2. Drag `SlackThemed.app` from `/Applications` to your Dock
3. (Optional) Copy Slack's icon to SlackThemed:
   ```bash
   cp /Applications/Slack.app/Contents/Resources/electron.icns \
      /Applications/SlackThemed.app/Contents/Resources/icon.icns
   ```

Now launch Slack using **SlackThemed** — your theme will be applied automatically.

## Applying Theme Changes

After editing `theme.yaml`, re-apply your theme:

```bash
cd ~/.config/slack && npm run inject
```

Or simply relaunch SlackThemed.

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

### Switching Themes

Pre-made themes are included in the `themes/` directory:

- `github-dark-high-contrast.yaml`
- `dracula.yaml`
- `nord.yaml`
- `catppuccin-mocha.yaml`
- `solarized-dark.yaml`
- `one-dark.yaml`

To switch themes, copy your preferred theme to `theme.yaml`:

```bash
cp ~/.config/slack/themes/dracula.yaml ~/.config/slack/theme.yaml
```

Then relaunch SlackThemed or run `npm run inject`.

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

## How It Works

This project uses the [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) to inject CSS into Slack's Electron-based desktop app.

1. SlackThemed launches Slack with `--remote-debugging-port=9222`
2. The inject script connects via WebSocket to the DevTools endpoint
3. CSS is injected into the page using `Runtime.evaluate`
4. A `<style>` element is added to the document head

**No files in the Slack app are modified.** The CSS injection happens at runtime and doesn't affect Slack's code signature or require any special permissions.

## Security Considerations

**Remote debugging port exposure:** This tool launches Slack with a remote debugging port open on `127.0.0.1:9222`. While only accessible locally, any process on your machine can connect to this port and:

- Read all visible Slack messages
- Execute arbitrary JavaScript in Slack's context
- Access Slack's session data

**Mitigations:**
- The port only binds to localhost (not accessible from network)
- Use a non-default port via `SLACK_DEBUG_PORT` environment variable
- Only use on trusted machines

This is an inherent tradeoff of runtime CSS injection without modifying application files.

## File Structure

```
~/.config/slack/
├── theme.yaml          # Your active theme
├── base.css            # CSS selectors (edit to add new elements)
├── src/
│   ├── inject-css.js   # Injection script
│   └── start-slack.sh  # Launch helper (used by SlackThemed.app)
├── SlackThemed.app/    # Dock app launcher
├── themes/             # Pre-made themes
│   ├── github-dark-high-contrast.yaml
│   ├── dracula.yaml
│   ├── nord.yaml
│   ├── catppuccin-mocha.yaml
│   ├── solarized-dark.yaml
│   └── one-dark.yaml
└── README.md
```

## Compatibility

**Tested with:** Slack 4.x on macOS

Slack updates may change CSS class names, causing some elements to lose theming. If you notice unstyled elements after a Slack update, use the browser DevTools at `http://127.0.0.1:9222` to inspect and identify new selectors.

## Troubleshooting

### Theme not applying

1. Make sure you launched Slack using **SlackThemed**, not the original Slack app
2. Verify the debug port is active:
   ```bash
   curl -s http://127.0.0.1:9222/json | head -5
   ```
3. Manually re-inject the theme:
   ```bash
   cd ~/.config/slack && npm run inject
   ```

### Theme disappears after navigating

The theme may need to be reinjected after certain navigation events. Run `npm run inject` again, or relaunch SlackThemed.

### Slack won't start

If Slack crashes on launch:

```bash
# Kill any existing Slack processes
pkill -x Slack

# Relaunch SlackThemed
open /Applications/SlackThemed.app
```

### Changes not visible

After editing `theme.yaml`, you must re-inject the theme:

```bash
cd ~/.config/slack && npm run inject
```

## Advanced

### Adding New Selectors

If you find UI elements that aren't themed, you can add selectors to `base.css`:

1. Open Slack's DevTools: Navigate to `http://127.0.0.1:9222` in Chrome
2. Click the Slack page target to open DevTools
3. Inspect the element to find its class name
4. Add the selector to the appropriate section in `base.css`
5. Use `var(--theme-*)` variables for colors

### Creating Custom Themes

1. Copy an existing theme as a starting point:
   ```bash
   cp ~/.config/slack/themes/nord.yaml ~/.config/slack/themes/my-theme.yaml
   ```
2. Edit the colors in your new theme file
3. Activate it:
   ```bash
   cp ~/.config/slack/themes/my-theme.yaml ~/.config/slack/theme.yaml
   ```
4. Relaunch SlackThemed or run `npm run inject`

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Ideas for Contributions

- Additional theme presets
- New CSS selectors for unstyled elements
- Linux/Windows support
- Theme switching CLI tool

## License

MIT License - See [LICENSE](LICENSE) for details.

## Acknowledgments

- Theme colors from [GitHub Primer](https://primer.style/primitives/colors), [Dracula](https://draculatheme.com/), [Nord](https://nordtheme.com/), [Catppuccin](https://catppuccin.com/), and other popular themes
