# Dice API

This rolls dice. It's cool.

## Running Locally

Requires Node.js. Go install it.

```sh
$ npm install
$ npm start
```

It's now running on [localhost:5000](http://localhost:5000/).

## Integrating with Slack

Add a new "slash command" that makes a GET request to &lt;your server&gt;/roll/slack. Done. Example: "/roll 1d20+5"
