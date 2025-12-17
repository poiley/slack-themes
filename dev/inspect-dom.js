#!/usr/bin/env node

const http = require('http');
const WebSocket = require('ws');

const DEBUG_PORT = 9222;

async function getTargets() {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${DEBUG_PORT}/json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function queryDOM(wsUrl, expression) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression, returnByValue: true }
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
    setTimeout(() => { ws.close(); resolve({ timeout: true }); }, 5000);
  });
}

async function main() {
  const targets = await getTargets();
  const page = targets.find(t => t.type === 'page' && t.url.includes('app.slack.com'));

  if (!page) {
    console.log('No Slack page found');
    return;
  }

  console.log('=== Date Badge Classes ===');
  const dateBadges = await queryDOM(page.webSocketDebuggerUrl, `
    Array.from(document.querySelectorAll('[class*="day_divider"], [class*="date"], [class*="pill"], [class*="jump"]'))
      .slice(0, 5)
      .map(el => ({ tag: el.tagName, class: el.className, text: el.textContent?.slice(0, 50) }))
  `);
  console.log(JSON.stringify(dateBadges, null, 2));

  console.log('\n=== Link Unfurl Classes ===');
  const unfurls = await queryDOM(page.webSocketDebuggerUrl, `
    Array.from(document.querySelectorAll('[class*="unfurl"], [class*="attachment"], [class*="preview"]'))
      .slice(0, 5)
      .map(el => ({ tag: el.tagName, class: el.className, text: el.textContent?.slice(0, 50) }))
  `);
  console.log(JSON.stringify(unfurls, null, 2));
}

main().catch(console.error);
