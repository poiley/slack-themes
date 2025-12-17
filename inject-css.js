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

const DEBUG_PORT = 9222;
const CONFIG_DIR = path.join(process.env.HOME, '.config/slack');
const THEME_FILE = path.join(CONFIG_DIR, 'theme.yaml');
const BASE_CSS_FILE = path.join(CONFIG_DIR, 'base.css');
// Fallback to old styles.css if base.css doesn't exist
const LEGACY_CSS_FILE = path.join(CONFIG_DIR, 'styles.css');

// Simple YAML parser for our theme format
function parseYaml(content) {
  const result = {};
  let currentSection = null;

  const lines = content.split('\n');
  for (const line of lines) {
    // Skip full-line comments and empty lines
    if (line.trim().startsWith('#') || line.trim() === '') continue;

    // Check indentation
    const indent = line.search(/\S/);
    const trimmed = line.trim();

    // Find the first colon that separates key from value
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let value = trimmed.slice(colonIdx + 1).trim();

    // Remove surrounding quotes from value
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (indent === 0) {
      // Top-level key
      if (value === '') {
        // Section header
        currentSection = key;
        result[currentSection] = {};
      } else {
        // Simple key-value
        result[key] = value;
      }
    } else if (currentSection && indent > 0) {
      // Nested key-value
      result[currentSection][key] = value;
    }
  }

  return result;
}

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

  // Try to load theme.yaml + base.css
  if (fs.existsSync(THEME_FILE) && fs.existsSync(BASE_CSS_FILE)) {
    try {
      // Read and parse theme
      const themeContent = fs.readFileSync(THEME_FILE, 'utf8');
      const theme = parseYaml(themeContent);
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
  } else if (fs.existsSync(LEGACY_CSS_FILE)) {
    // Fallback to legacy styles.css
    try {
      css = fs.readFileSync(LEGACY_CSS_FILE, 'utf8');
      console.log(`[+] Loaded legacy CSS from ${LEGACY_CSS_FILE}`);
    } catch (err) {
      console.error(`[-] Could not read CSS file: ${err.message}`);
      process.exit(1);
    }
  } else {
    console.error(`[-] No theme files found.`);
    console.error(`    Create theme.yaml and base.css in ${CONFIG_DIR}`);
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
