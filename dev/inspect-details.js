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
            (function() {
              const results = {};

              // Profile/details panel
              const detailsPanel = Array.from(document.querySelectorAll('[class*="details"], [class*="profile"], [class*="flexpane"]'))
                .slice(0, 10)
                .map(el => ({
                  tag: el.tagName,
                  class: (el.className || '').toString().slice(0, 100),
                  bg: getComputedStyle(el).backgroundColor
                }));
              results.detailsPanel = detailsPanel;

              // Cards/sections
              const cards = Array.from(document.querySelectorAll('[class*="card"], [class*="section"], [class*="block"]'))
                .filter(el => {
                  const bg = getComputedStyle(el).backgroundColor;
                  return bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(10, 12, 16)';
                })
                .slice(0, 10)
                .map(el => ({
                  tag: el.tagName,
                  class: (el.className || '').toString().slice(0, 100),
                  bg: getComputedStyle(el).backgroundColor
                }));
              results.cards = cards;

              // Buttons with backgrounds
              const buttons = Array.from(document.querySelectorAll('button'))
                .filter(el => {
                  const bg = getComputedStyle(el).backgroundColor;
                  const text = el.textContent || '';
                  return (text.includes('Mute') || text.includes('VIP') || text.includes('Hide') || text.includes('Huddle'));
                })
                .slice(0, 6)
                .map(el => ({
                  tag: el.tagName,
                  class: (el.className || '').toString().slice(0, 100),
                  bg: getComputedStyle(el).backgroundColor,
                  text: (el.textContent || '').slice(0, 20)
                }));
              results.buttons = buttons;

              // Find elements with the specific gray background
              const grayEls = Array.from(document.querySelectorAll('*'))
                .filter(el => {
                  const bg = getComputedStyle(el).backgroundColor;
                  return bg === 'rgb(26, 29, 33)' || bg === 'rgb(34, 37, 41)' || bg === 'rgb(30, 33, 37)';
                })
                .slice(0, 15)
                .map(el => ({
                  tag: el.tagName,
                  class: (el.className || '').toString().slice(0, 100),
                  bg: getComputedStyle(el).backgroundColor
                }));
              results.grayElements = grayEls;

              return results;
            })()
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
