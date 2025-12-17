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

              // Channel tab bar
              const tabBar = document.querySelector('[class*="channel_tab_bar"]');
              if (tabBar) {
                results.tabBar = {
                  class: tabBar.className.slice(0, 60),
                  bg: getComputedStyle(tabBar).backgroundColor
                };
              }

              // View contents
              const viewContents = document.querySelector('.p-view_contents--primary');
              if (viewContents) {
                results.viewContents = {
                  class: viewContents.className.slice(0, 60),
                  bg: getComputedStyle(viewContents).backgroundColor
                };
              }

              // View header actions
              const headerActions = document.querySelector('.p-view_header__actions');
              if (headerActions) {
                results.headerActions = {
                  class: headerActions.className.slice(0, 60),
                  bg: getComputedStyle(headerActions).backgroundColor
                };
              }

              // Footer
              const footer = document.querySelector('.p-workspace__primary_view_footer');
              if (footer) {
                results.footer = {
                  class: footer.className.slice(0, 60),
                  bg: getComputedStyle(footer).backgroundColor
                };
              }

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
