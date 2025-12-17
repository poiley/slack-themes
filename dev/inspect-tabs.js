#!/usr/bin/env node

const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const targets = JSON.parse(data);
    const page = targets.find(t => t.type === 'page' && t.url.includes('app.slack.com'));
    if (!page) { console.log('No page'); return; }

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.on('open', () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            // Find the tab bar with Messages/Files/etc
            const tabBar = Array.from(document.querySelectorAll('[class*="tab"], [class*="bookmark"], [class*="canvas"], [class*="header"]'))
              .filter(el => {
                const text = el.textContent || '';
                return text.includes('Messages') || text.includes('Add canvas') || text.includes('Files');
              })
              .slice(0, 8)
              .map(el => ({ tag: el.tagName, class: el.className.slice(0,120), bg: getComputedStyle(el).backgroundColor }));

            // Find the input footer/wrapper
            const inputArea = Array.from(document.querySelectorAll('[class*="input"], [class*="footer"], [class*="composer"]'))
              .filter(el => el.className && typeof el.className === 'string' && el.className.length > 5)
              .slice(0, 10)
              .map(el => ({ tag: el.tagName, class: el.className.slice(0,120), bg: getComputedStyle(el).backgroundColor }));

            // Find specific "primary view" wrappers
            const primaryView = Array.from(document.querySelectorAll('[class*="primary_view"], [class*="workspace__input"]'))
              .slice(0, 5)
              .map(el => ({ tag: el.tagName, class: el.className.slice(0,120), bg: getComputedStyle(el).backgroundColor }));

            ({ tabBar, inputArea, primaryView })
          `,
          returnByValue: true
        }
      }));
    });
    ws.on('message', (msg) => {
      const result = JSON.parse(msg);
      if (result.id === 1) {
        console.log(JSON.stringify(result.result, null, 2));
        ws.close();
      }
    });
  });
});
