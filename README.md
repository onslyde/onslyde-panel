## Getting Started
The only prerequisite is node.js 0.6.15+ on your path.

* run `scripts/web-server.js`
* open the example panel in Chrome `http://localhost:8001/example-panel.html`
* to interact, open the panel remote (this must be opened in an incognito tab or different browser like Safari) `http://localhost:8001/panel-remote.html?session=194`
* Note - the default session is `194`. If you are making changes and testing locally, [you'll need a new private session](http://onslyde.com/) <- click the "create presentation" button.
* Get your new session ID and add it to the init object in the bottom of example-panel.html (replacing the existing one)
* For the remote, pass it through the query parameter `http://localhost:8001/panel-remote.html?session=[new ID]`
