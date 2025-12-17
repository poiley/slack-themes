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
            // Find the Messages button and trace up to parent containers
            const msgBtn = document.querySelector('[data-qa="channel_header_messages_tab"], [aria-label*="Messages"], button[data-tab="messages"]');

            // Get ancestors
            function getAncestors(el, depth = 8) {
              const ancestors = [];
              let current = el;
              for (let i = 0; i < depth && current; i++) {
                ancestors.push({
                  tag: current.tagName,
                  class: (current.className || '').slice(0, 120),
                  bg: getComputedStyle(current).backgroundColor
                });
                current = current.parentElement;
              }
              return ancestors;
            }

            // Also find elements with "channel" and "header" in class
            const channelHeaders = Array.from(document.querySelectorAll('[class*="channel"][class*="header"], [class*="view_header"], [class*="bookmarks"]'))
              .slice(0, 10)
              .map(el => ({
                tag: el.tagName,
                class: (el.className || '').slice(0, 120),
                bg: getComputedStyle(el).backgroundColor
              }));

            // Find the workspace input and its ancestors
            const inputWrapper = document.querySelector('.p-workspace__input');
            const inputAncestors = inputWrapper ? getAncestors(inputWrapper, 5) : [];

            ({
              msgBtnAncestors: msgBtn ? getAncestors(msgBtn) : 'not found',
              channelHeaders,
              inputAncestors
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
