# remote-box-locker

Remotely lock/unlock your computer (Linux) using HTTP/JSON, SSH Key & IP whitelisting

## System Requirements

- node.js and npm
- SSH Private Key (a password must be set)
- `.env` file for setting up required configurations

## Install

```
git clone https://github.com/arafathusayn/remote-box-locker.git && cd remote-box-locker && npm install
```

## Configuration

Create a `.env` file in the `remote-box-locker` directory, then you can set these environment variables:

```
SERVER_PORT=3333

USERNAME=<your computer username> 

TRUST_PROXY=true or false

IP_WHITELIST=<comma seperated IP addresses> eg. 192.168.0.100,192.168.0.101

PRIVATE_KEY_PATH=/home/<USERNAME>/.ssh/id_rsa
```

### Notes

- `USERNAME` env variable is **required**.
- If your computer network is behind a trustable proxy, set `TRUST_PROXY=true` so that `IP_WHITELIST` can work properly. Default: `false`.
- `IP_WHITELIST` always includes `localhost,127.0.0.1` as whitelisted
- `PRIVATE_KEY_PATH` is your SSH private key path. It's optional. Default: `/home/<USERNAME>/.ssh/id_rsa`

## Running server

```
node app.js
```

### If you use pm2:

```
pm2 start -f app.js
```

## API Usage

### Locking

To **lock** the computer running the server, send HTTP `POST` request to <br>
```
Endpoint: /lock

eg. http://localhost:3333/lock
```
along with HTTP Header `Content-Type:` `application/json` and the JSON data in POST Body:

```
{
  "password": "<Your SSH Private Key Password>"
}
```

### Unlocking

To **unlock** the computer running the server, send HTTP `POST` request to <br>
```
Endpoint: /unlock

eg. http://localhost:3333/unlock
```
along with HTTP Header `Content-Type:` `application/json` and the JSON data in POST Body:

```
{
  "password": "<Your SSH Private Key Password>"
}
```
