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
            // Find all elements and search for ones containing "Messages" that aren't in sidebar
            const allEls = Array.from(document.querySelectorAll('*'));

            // Find "Messages" tab specifically
            const msgTab = allEls.find(el => {
              const text = el.textContent;
              const cls = el.className || '';
              return text === 'Messages' && !cls.includes('sidebar');
            });

            function getAncestors(el, depth = 10) {
              const ancestors = [];
              let current = el;
              for (let i = 0; i < depth && current && current !== document.body; i++) {
                const style = getComputedStyle(current);
                ancestors.push({
                  tag: current.tagName,
                  class: (current.className || '').toString().slice(0, 100),
                  bg: style.backgroundColor,
                  border: style.border
                });
                current = current.parentElement;
              }
              return ancestors;
            }

            // Find bookmarks bar
            const bookmarks = Array.from(document.querySelectorAll('[class*="bookmark"], [class*="canvas_tab"], [class*="pinned"]'))
              .slice(0, 8)
              .map(el => ({
                tag: el.tagName,
                class: (el.className || '').slice(0, 100),
                bg: getComputedStyle(el).backgroundColor
              }));

            // Find view header
            const viewHeader = Array.from(document.querySelectorAll('[class*="view_header"], [class*="channel_header"], [class*="secondary_view"]'))
              .slice(0, 8)
              .map(el => ({
                tag: el.tagName,
                class: (el.className || '').slice(0, 100),
                bg: getComputedStyle(el).backgroundColor
              }));

            // The message pane footer
            const footer = Array.from(document.querySelectorAll('[class*="primary_view_footer"], [class*="pane_input"]'))
              .slice(0, 5)
              .map(el => ({
                tag: el.tagName,
                class: (el.className || '').slice(0, 100),
                bg: getComputedStyle(el).backgroundColor
              }));

            ({
              msgTabAncestors: msgTab ? getAncestors(msgTab) : 'not found',
              bookmarks,
              viewHeader,
              footer
            })
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
