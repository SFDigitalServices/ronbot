const express = require('express');
const router = express.Router();
const axios = require('axios');
const yaml = require('js-yaml')
const fs = require('fs');

const slackServices = require('../services/slack-services');

let acronyms;

try {
  acronyms = yaml.safeLoad(fs.readFileSync('./acronyms/acronyms.yml', 'utf-8'));
} catch(e) {
  console.log(e);
}

router.post('/', (req, res, next) => {
  if(req.body.challenge) {
    res.send(req.body.challenge); // use this for verifying request url for slack event subscriptions
  } else {
    let payload = req.body;
    res.sendStatus(200);
    let directMessageToBot = (payload.event.type === 'message' && payload.event.channel_type === 'im' && !payload.event.bot_id) ? true : false;
    if(payload.event.type === 'app_mention' || directMessageToBot) {
      if(payload.event.text) {
        let userMessage = payload.event.text.trim().toLowerCase();
        let commandString = userMessage.substring(userMessage.indexOf(' ')+1);
        let command = commandString.indexOf(' ') >= 0 ? commandString.substring(0, commandString.indexOf(' ')) : commandString;
        let args = commandString.substring(command.length+1).split(' ');
        switch(command) {
          case 'quote':
            axios.get('http://ron-swanson-quotes.herokuapp.com/v2/quotes').then((response) => {
              let quote = response.data[0];
              slackServices.postMessage('https://slack.com/api/chat.postMessage', {
                channel: payload.event.channel,
                text: '> ' + quote
              });
            });
            break;
          case 'sfgov-content-sandbox':
            if(!directMessageToBot) { // not a direct message, respond in thread and direct message user
              slackServices.postMessage('https://slack.com/api/chat.postMessage', {
                channel: payload.event.channel,
                thread_ts: payload.event.event_ts,
                text: 'Let\'s chat.  I\'ll send you a direct message.'
              })
            }
            slackServices.postMessage('https://slack.com/api/chat.postMessage', {
              "channel": payload.event.user, // direct message user
              "user": payload.event.user,
              "as_user": true,
              "attachments": [
                {
                  "blocks": [
                    {
                      "type": "section",
                      "text": {
                        "type": "mrkdwn",
                        "text": "Hello <@" + payload.event.user +">.  You asked me to manually (re)create the <https://content-sfgov.pantheonsite.io|sf.gov content sandbox> on pantheon.  This will wipe out the existing sandbox and create a new one by cloning everything in the current production environment.\n\nAre you sure you want to do this?"
                      }
                    },
                    {
                      "type": "actions",
                      "elements": [
                        {
                          "type": "button",
                          "text": {
                            "type": "plain_text",
                            "emoji": true,
                            "text": "Yes"
                          },
                          "style": "primary",
                          "value": "sfgov_content_sandbox_yes"
                        },
                        {
                          "type": "button",
                          "text": {
                            "type": "plain_text",
                            "emoji": true,
                            "text": "No"
                          },
                          "style": "danger",
                          "value": "sfgov_content_sandbox_no"
                        }
                      ]
                    }
                  ]
                }
              ]
            });
            break;
          case 'acronym':
          case 'whatis':
          case "what’s":
            let acronym = args[0];
            let found = false;
            let threadTs = payload.event.thread_ts ? payload.event.thread_ts : null;
            for(let key in acronyms) {
              let regex = '\\s?' + key.toLowerCase() + '(\\s|\\W|$)';
              let re = new RegExp(regex, 'g');
              let matches = acronym.match(re);
              if(matches) {
                found = true;
                let messageText = acronyms[key];
                slackServices.postMessage('https://slack.com/api/chat.postMessage', {
                  channel: payload.event.channel,
                  thread_ts: threadTs,
                  text: '*' + key + '* is probably an acronym for _' + messageText + '_'
                });
                break;
              }
            }
            if(!found) {
              slackServices.postMessage('https://slack.com/api/chat.postMessage', {
                channel: payload.event.channel,
                thread_ts: payload.event.ts,
                text: "The acronym you requested was not found.  If you need to add it, please follow these instructions: https://github.com/SFDigitalServices/ronbot/tree/master/acronyms"
              });
            }
            break;
          case 'help':
            slackServices.postMessage('https://slack.com/api/chat.postMessage', {
              channel: payload.event.channel,
              text: 'Help has arrived.\n' +
                '>>>' + 
                '`@ronbot sfgov-content-sandbox` - (re)create sf.gov content sandbox on pantheon based on production\n' +
                '`@ronbot acronym/whatis/what’s abc` - if found, unfurls the acronym abc\n' + 
                '`@ronbot quote` - be prepared to receive wisdom\n' + 
                '`@ronbot help` - this menu\n'
            });
            break;
          default:
            slackServices.postMessage('https://slack.com/api/chat.postMessage', {
              channel: payload.event.channel,
              text: 'I don\'t understand the command: `' + command + '`.  Try `@ronbot help`'
            }); 
            break;
        }
      }
    }
  }
});

module.exports = router;
