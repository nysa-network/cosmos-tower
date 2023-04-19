# Cosmos tower

## Setup 

### Grant `MsgVote` from validator address

```bash
export GRANTEE=stars13lxkjj7959yda7xqrlrf07zenmgrezheypxzvs

$DAEMON_NAME tx authz grant $GRANTEE generic --msg-type /cosmos.gov.v1beta1.MsgVote --from validator --fees 50000ustars
```
