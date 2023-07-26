# Cosmos tower

## Installation

### Create a Discord bot

[here is a nice tutorial from discord.js docs](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)

1. Create your own discord server
2. Go to https://discord.com/developers/applications?new_application=true and create a new application
3. On the General Information page, copy Application ID and Public Key, you can also setup an app icon
4. Go on Application Testers page and add yourself
5. On the OAuth2 Page/URL Generator, select scope `bot`, and bot permissions: `Send Messages`, `Add Reactions`, `Read Message History`
   You should have a URL like: `https://discord.com/api/oauth2/authorize?client_id={CLIENT_ID}&permissions=67648&scope=bot`
6. Go on this url and add the discord bot into your server
7. Create a private channel, and add your bot inside of it
8. On discord app, go to app testers, and add yourself as a tester.

## Setup wallet

### Grant `MsgVote` from validator address

```bash
export GRANTEE=stars13lxkjj7959yda7xqrlrf07zenmgrezheypxzvs

$DAEMON_NAME tx authz grant $GRANTEE generic --msg-type /cosmos.gov.v1beta1.MsgVote --from validator --fees 50000ustars
```

You can use [tfm.com](https://tfm.com/bridge) to send money via ibc to every wallet address

### Config

1. Setup the default config for your bot

```bash
cp config.example.yml config.yml
echo '[]' > cosmos-tower.db.json
```

2. Install [docker](https://docs.docker.com/engine/install/) and [docker-compose]()

3. Start it ! :tada:

```bash
docker-compose up -d
```
