#!/usr/bin/env node
//
// inject-css.js
// Reads theme.yaml, generates CSS variables, combines with base.css, and injects into Slack
//
// Usage: node inject-css.js
//

const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DEBUG_PORT = process.env.SLACK_DEBUG_PORT || 9222;
const CONFIG_DIR = process.env.XDG_CONFIG_HOME
  ? path.join(process.env.XDG_CONFIG_HOME, 'slack')
  : path.join(process.env.HOME, '.config/slack');
const THEME_FILE = path.join(CONFIG_DIR, 'theme.yaml');
const BASE_CSS_FILE = path.join(CONFIG_DIR, 'base.css');

// Generate CSS variables from theme
function generateCssVariables(theme) {
  let css = ':root {\n';

  // Colors
  if (theme.colors) {
    for (const [key, value] of Object.entries(theme.colors)) {
      css += `  --theme-${key}: ${value};\n`;
    }
  }

  // Font
  if (theme.font) {
    if (typeof theme.font === 'string') {
      css += `  --theme-font: ${theme.font};\n`;
    } else if (theme.font.family) {
      css += `  --theme-font: ${theme.font.family};\n`;
    }
  }

  css += '}\n\n';
  return css;
}

async function getTargets() {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${DEBUG_PORT}/json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function injectCSS(wsUrl, css) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let msgId = 1;

    ws.on('open', () => {
      ws.send(JSON.stringify({
        id: msgId++,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (function() {
              function inject() {
                if (!document.head) {
                  setTimeout(inject, 100);
                  return 'waiting for head';
                }
                const existingStyle = document.getElementById('custom-slack-theme');
                if (existingStyle) existingStyle.remove();

                const style = document.createElement('style');
                style.id = 'custom-slack-theme';
                style.textContent = ${JSON.stringify(css)};
                document.head.appendChild(style);
                return 'CSS injected into ' + document.title;
              }
              return inject();
            })()
          `
        }
      }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.id === 1) {
        ws.close();
        resolve(msg.result);
      }
    });

    ws.on('error', reject);

    setTimeout(() => {
      ws.close();
      resolve({ timeout: true });
    }, 5000);
  });
}

async function main() {
  let css = '';

  // Check required files exist
  if (!fs.existsSync(THEME_FILE)) {
    console.error(`[-] Theme file not found: ${THEME_FILE}`);
    console.error(`    Create theme.yaml in ${CONFIG_DIR}`);
    process.exit(1);
  }

  if (!fs.existsSync(BASE_CSS_FILE)) {
    console.error(`[-] Base CSS not found: ${BASE_CSS_FILE}`);
    console.error(`    Create base.css in ${CONFIG_DIR}`);
    process.exit(1);
  }

  try {
    // Read and parse theme with js-yaml
    const themeContent = fs.readFileSync(THEME_FILE, 'utf8');
    const theme = yaml.load(themeContent);
    console.log(`[+] Loaded theme: ${theme.name || 'Custom'}`);

    // Generate CSS variables
    const variables = generateCssVariables(theme);

    // Read base CSS
    const baseCSS = fs.readFileSync(BASE_CSS_FILE, 'utf8');
    console.log(`[+] Loaded base CSS from ${BASE_CSS_FILE}`);

    // Combine
    css = variables + baseCSS;
  } catch (err) {
    console.error(`[-] Error loading theme: ${err.message}`);
    process.exit(1);
  }

  // Get debugging targets
  let targets;
  try {
    targets = await getTargets();
  } catch {
    console.error(`[-] Could not connect to Slack debugging port ${DEBUG_PORT}`);
    console.error(`    Start Slack with: /Applications/Slack.app/Contents/MacOS/Slack --remote-debugging-port=9222`);
    process.exit(1);
  }

  // Filter for page targets (Slack windows)
  const pages = targets.filter(t => t.type === 'page' && t.webSocketDebuggerUrl);

  if (pages.length === 0) {
    console.error('[-] No Slack pages found');
    process.exit(1);
  }

  console.log(`[+] Found ${pages.length} Slack window(s)`);

  // Inject CSS into each page
  for (const page of pages) {
    try {
      console.log(`[+] Injecting into: ${page.title || page.url}`);
      await injectCSS(page.webSocketDebuggerUrl, css);
      console.log(`    Done!`);
    } catch (err) {
      console.error(`    Failed: ${err.message}`);
    }
  }

  console.log('[+] CSS injection complete');
}

main();
