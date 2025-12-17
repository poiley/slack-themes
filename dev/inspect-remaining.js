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

  // Find date pills (Today/Yesterday)
  console.log('=== Date Pills ===');
  const datePills = await queryDOM(page.webSocketDebuggerUrl, `
    Array.from(document.querySelectorAll('button'))
      .filter(el => el.textContent.includes('Today') || el.textContent.includes('Yesterday'))
      .slice(0, 3)
      .map(el => ({ tag: el.tagName, class: el.className, computedBg: getComputedStyle(el).backgroundColor }))
  `);
  console.log(JSON.stringify(datePills, null, 2));

  // Find message input container
  console.log('\\n=== Message Input ===');
  const msgInput = await queryDOM(page.webSocketDebuggerUrl, `
    Array.from(document.querySelectorAll('[class*="message_input"], [class*="composer"], [class*="wysiwyg"], [class*="ql-"]'))
      .slice(0, 8)
      .map(el => ({ tag: el.tagName, class: el.className.slice(0,100), computedBg: getComputedStyle(el).backgroundColor }))
  `);
  console.log(JSON.stringify(msgInput, null, 2));

  // Find inline code
  console.log('\\n=== Inline Code ===');
  const inlineCode = await queryDOM(page.webSocketDebuggerUrl, `
    Array.from(document.querySelectorAll('code, [class*="code"]'))
      .slice(0, 5)
      .map(el => ({ tag: el.tagName, class: el.className, computedBg: getComputedStyle(el).backgroundColor, text: el.textContent.slice(0,30) }))
  `);
  console.log(JSON.stringify(inlineCode, null, 2));

  // Find quoted/shared messages
  console.log('\\n=== Quoted/Shared Messages ===');
  const quoted = await queryDOM(page.webSocketDebuggerUrl, `
    Array.from(document.querySelectorAll('[class*="broadcast"], [class*="shared"], [class*="attachment"], [class*="secondary"]'))
      .filter(el => el.className.includes('message') || el.className.includes('attachment'))
      .slice(0, 5)
      .map(el => ({ tag: el.tagName, class: el.className.slice(0,120), computedBg: getComputedStyle(el).backgroundColor }))
  `);
  console.log(JSON.stringify(quoted, null, 2));
}

main().catch(console.error);
