ronbot
- is a slackbot that does things
- is a node/express app
- uses circleci to deploy to heroku
- uses a postgres db with one table
- uses docker for local development
- should probably have some tests

`@ronbot [command]`

> `sfgov-content-sandbox` (re)create sf.gov content sandbox on pantheon based on production \
`what's <acronym>` unfurls an acronym \
`schedule notetakers` schedules reminders for notetakers \
`refresh <acronyms, notetakers>` refreshes a thing (just those two actually) \
`quote` - be prepared to receive wisdom \
`help` - this menu \
[acronyms](https://docs.google.com/spreadsheets/d/13fcfWufGFEIVvca-1hP7mchVg9q6n7LOvdxYDBTdQiw/edit#gid=0) \
[notetakers](https://docs.google.com/spreadsheets/d/1InM7iZlUqNy3L_oiB6CfskISQAx1W24v05R0sLrfI1c/edit#gid=979594215)

# Local development

1. [Get added as a collaborator for ronbot at https://api.slack.com/apps](#get-added-as-a-collaborator)
2. [Get and start ngrok](#ngrok)

3. [Set up environment](#set-up-environment)
    - [Get Docker](#get-docker)
    - [Clone this repo and install dependencies](#clone-this-repo-and-install-dependencies)
    - [Create .env file](#create-.env-file)
    - [Start the app](#start-the-app)
4. [Update urls](#update-urls)
5. [Read some docs](#read-some-docs)
6. [Misc notes](#misc-notes)

## Get added as a collaborator
You'll need to be added as a collaborator for ronbot in order to see the settings on https://api.slack.com/apps.  Talk to a slack admin in SFDS to set this up.

For local development, the most important thing is to be able to update the **Event Subscriptions** request url.

## ngrok
ngrok (pronounced "en-grok") allows you to expose a web server running on your local machine to the internet.

Get ngrok: https://ngrok.com/download

Once downloaded, open a terminal and start it up:

```bash
$ ngrok http 4390 # this port number can be anything you like
```

And you should see this:

```bash
ngrok by @inconshreveable                                                                                                                   (Ctrl+C to quit)
                                                                                                                                                            
Session Status                online                                                                                                                        
Account                       Anthony Kong (Plan: Free)                                                                                                     
Version                       2.3.34                                                                                                                        
Region                        United States (us)                                                                                                            
Web Interface                 http://127.0.0.1:4040                                                                                                         
Forwarding                    http://9cd5682e.ngrok.io -> http://localhost:4390                                                                             
Forwarding                    https://9cd5682e.ngrok.io -> http://localhost:4390                                                                            
                                                                                                                                                            
Connections                   ttl     opn     rt1     rt5     p50     p90                                                                                   
                              2       0       0.02    0.01    2.78    5.01        
```

**The port you use when starting ngrok will be the same you assign to the PORT var when you create your .env file**

## Set up environment

### Get Docker
[Download Docker](https://docs.docker.com/get-docker/) and [read the docs on setting up](https://docs.docker.com/get-started/).

Or skip that and jump to the bottom of this readme for some helpful commands after `docker-compose up --scale pgadmin=0`

### Clone this repo and install dependencies

```bash
git clone git@github.com:SFDigitalServices/ronbot.git
cd ronbot
npm install
```
### Create .env file
Create a `.env` file in the root of the project.  It should look like this:

```bash
SLACKBOT_TOKEN=abcdefg12345678 # get this info from https://api.slack.com/apps/AM11J7ULV/oauth
CIRCLECI_API_TOKEN=abcdefg12345678 # get this info from https://circleci.com/account/api
PORT={port number from nrgok above}
GOOGLE_CONFIG= # google config json string (notes below)
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials-heroku.json
ACRONYMS_SHEET={"id":"13fcfWufGFEIVvca-1hP7mchVg9q6n7LOvdxYDBTdQiw","range":"Sheet1"}
NOTETAKERS_SHEET={"id":"1InM7iZlUqNy3L_oiB6CfskISQAx1W24v05R0sLrfI1c","range":"ronbot"}
DATABASE_DEV_URL=postgres://user:pass@postgres:5432/db
```

THe `GOOGLE_CONFIG` environment variable is a json string that you get after creating a service account via the google clould platform console.  This env var is only necessary if you need to interact with the google sheets api add/edit a ronbot command.  If you don't need to, simply set it to `{}`

### Start the app

This app uses docker for local development.  This command will start up the container for the ronbot app.  The `--scale pgadmin=0` option excludes the pgadmin service.  It's there if you want it, but it's not necessary

```bash
docker-compose up --scale pgadmin=0
```

Verify that ngrok is forwarding and all is well:
```bash
curl -I https://9cd5682e.ngrok.io
```

## Update urls

Update the event subscriptions url and interactive components request url to your local ngrok url

Go to https://api.slack.com/apps/AM11J7ULV/event-subscriptions and update the Event Subscriptions url to the ngrok url from the steps above (in this case: https://9cd5682e.ngrok.io/slack-events).

Do the same for the Interactive Components request url: https://api.slack.com/apps/AM11J7ULV/interactive-messages (in this case: https://9cd5682e.ngrok.io/slack-interactive)

Any interactions with ronbot should now be hitting your local environment.

When finished with development on your local machine, be sure to change the event subscriptions url back to https://ronswanbot.herokuapp.com/slack-events.  And the slack interactive url back to http://ronswanbot.herokuapp.com/slack-interactive.

If these urls aren't reverted and you shut off your computer, ronbot will be unresponsive to anyone trying to interact with him.

## Read some docs

Slack api documentation: https://api.slack.com/#read\_the\_docs

Docker docs: https://docs.docker.com/

Heroku docs: https://devcenter.heroku.com/

## Misc notes

- the app uses `nodemon` so the docker container doesn't have to be shut down and restart every time there is a code change

- if you want to `heroku pg:psql` to run some queries against the postgres db on heroku, you'll also need to have a local installation of postgres or you'll get the `The local psql command could not be located.` error.  There are a bunch of ways to do this.  Here's one:
  - [Download Postgres.app](https://postgresapp.com/downloads.html)
  - put this in `~/.bash_profile`
    - `export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"`

```bash
docker exec -it container_name bash # execute an interactive bash shell in container_name
```

```bash
docker exec -it db_container_name psql -U username db_name # interact with the database db in db_container_name as username
```

```bash
heroku pg:psql --app ronswanbot < ./db-init/init.sql # run a sql script on the heroku postgres db
```